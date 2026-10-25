import unittest
from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.session import Base, get_db
from app.main import app
from app.models.entities import AnalysisResult, MedicalParameter, MedicalReport, User


class HealthTrendsTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.session_factory = sessionmaker(bind=self.engine)
        self._seed_reports()

        def override_db():
            db = self.session_factory()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_db
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
        self.client = TestClient(app)
        self.reports_url = f"{settings.API_V1_STR}/reports"

    def tearDown(self):
        app.dependency_overrides.clear()
        self.engine.dispose()

    def _seed_reports(self):
        db = self.session_factory()
        db.add_all([
            User(id=1, email="trends@example.test", hashed_password="test"),
            User(id=2, email="private@example.test", hashed_password="test"),
        ])
        db.flush()
        db.add_all([
            MedicalReport(
                id=1, user_id=1, filename="old.pdf", original_filename="old.pdf",
                file_type="pdf", status="analyzed", report_date="Older report",
                created_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
            ),
            MedicalReport(
                id=2, user_id=1, filename="latest.pdf", original_filename="latest.pdf",
                file_type="pdf", status="analyzed", report_date="Latest report",
                created_at=datetime(2025, 2, 1, tzinfo=timezone.utc),
            ),
            MedicalReport(
                id=3, user_id=2, filename="private.pdf", original_filename="private.pdf",
                file_type="pdf", status="analyzed", report_date="Other user report",
                created_at=datetime(2025, 3, 1, tzinfo=timezone.utc),
            ),
        ])
        db.flush()
        parameters = [
            (1, "Hemoglobin", 14.0, "g/dL", 13, 17, "normal"),
            (2, "Hemoglobin", 12.5, "g/dL", 13, 17, "low"),
            (3, "Hemoglobin", 5.0, "g/dL", 13, 17, "low"),
            (1, "PCV", 58.0, "%", 40, 50, "high"),
            (2, "PCV", 44.0, "%", 40, 50, "normal"),
            (1, "Platelet Count", 150000.0, "cumm", 150000, 410000, "normal"),
            (2, "Platelet Count", 152000.0, "cumm", 150000, 410000, "normal"),
            (1, "MCV", 90.0, "fL", None, None, "unknown"),
            (2, "MCV", 95.0, "fL", None, None, "unknown"),
            (1, "WBC", 6.0, "10^3/uL", 4, 11, "normal"),
            (2, "WBC", 6000.0, "uL", 4000, 11000, "normal"),
        ]
        for report_id, name, value, unit, ref_min, ref_max, result_status in parameters:
            reference_range = (
                f"{ref_min} - {ref_max}"
                if ref_min is not None and ref_max is not None
                else None
            )
            db.add(MedicalParameter(
                report_id=report_id,
                name=name,
                value=value,
                raw_value=str(value),
                unit=unit,
                reference_range=reference_range,
                ref_min=ref_min,
                ref_max=ref_max,
                status=result_status,
                severity="moderate" if result_status == "low" else "none",
                category="blood",
            ))
        db.add_all([
            AnalysisResult(
                report_id=1, summary="Earlier", review_priority=20,
                priority_label="Low", status="completed",
            ),
            AnalysisResult(
                report_id=2, summary="Latest", review_priority=72,
                priority_label="Moderate", status="completed",
            ),
            AnalysisResult(
                report_id=3, summary="Private", review_priority=99,
                priority_label="High", status="completed",
            ),
        ])
        db.commit()
        db.close()

    def test_trends_are_chronological_and_scoped_to_current_user(self):
        response = self.client.get(f"{self.reports_url}/trends")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_reports"], 2)
        self.assertEqual(data["parameters_monitored"], 5)
        self.assertEqual(data["findings_needing_attention"], 1)
        self.assertEqual(data["latest_review_priority"], 72)
        hemoglobin = data["parameter_trends"][0]
        self.assertEqual(hemoglobin["name"], "Hemoglobin")
        self.assertEqual([row["value"] for row in hemoglobin["observations"]], [14.0, 12.5])
        self.assertEqual(hemoglobin["trend"], "down")
        self.assertEqual(data["recent_findings"][0]["value"], 12.5)
        progress = data["progress"]
        self.assertEqual(progress["first_report"]["id"], 1)
        self.assertEqual(progress["latest_report"]["id"], 2)
        parameter_progress = {item["name"]: item for item in progress["parameters"]}
        self.assertEqual(parameter_progress["Hemoglobin"]["progress_status"], "needs_attention")
        self.assertEqual(parameter_progress["PCV"]["progress_status"], "improved")
        self.assertEqual(parameter_progress["PCV"]["change"], -14.0)
        self.assertEqual(parameter_progress["Platelet Count"]["progress_status"], "stable")
        self.assertEqual(parameter_progress["MCV"]["progress_status"], "insufficient_data")
        self.assertNotIn("WBC", parameter_progress)
        self.assertEqual(progress["summary"]["improved"], 1)
        self.assertEqual(progress["summary"]["stable"], 1)
        self.assertEqual(progress["summary"]["needs_attention"], 1)
        self.assertEqual(progress["summary"]["insufficient_data"], 1)
        self.assertNotIn(
            3,
            [row["report_id"] for series in data["parameter_trends"] for row in series["observations"]],
        )

    def test_existing_report_routes_remain_available(self):
        self.assertEqual(self.client.get(self.reports_url).status_code, 200)
        self.assertEqual(self.client.get(f"{self.reports_url}/1").status_code, 200)
        self.assertEqual(self.client.get(f"{self.reports_url}/3").status_code, 404)
        self.assertEqual(self.client.delete(f"{self.reports_url}/1").status_code, 200)

    def test_single_report_does_not_fabricate_history(self):
        db = self.session_factory()
        db.query(MedicalReport).filter(MedicalReport.id == 1).delete()
        db.commit()
        db.close()

        data = self.client.get(f"{self.reports_url}/trends").json()
        hemoglobin = data["parameter_trends"][0]
        self.assertEqual(hemoglobin["trend"], "insufficient_data")
        self.assertEqual(len(hemoglobin["observations"]), 1)

    def test_empty_account_returns_empty_trends(self):
        db = self.session_factory()
        db.query(MedicalReport).filter(MedicalReport.user_id == 1).delete()
        db.commit()
        db.close()

        data = self.client.get(f"{self.reports_url}/trends").json()
        self.assertEqual(data["total_reports"], 0)
        self.assertEqual(data["parameter_trends"], [])


if __name__ == "__main__":
    unittest.main()
