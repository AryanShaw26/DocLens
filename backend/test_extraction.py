import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from pypdf import PdfReader

from app.rules.reference_ranges import evaluate_parameter, normalize_param_key
from app.services import gemini_service


class _FakeModel:
    def __init__(self, **kwargs):
        pass

    def generate_content(self, *args, **kwargs):
        return SimpleNamespace(text=json.dumps({
            "patient_name": "Sample Patient",
            "report_date": None,
            "source_interpretation": "AI-generated diagnosis",
            "parameters": [
                {
                    "name": "PID",
                    "value": 555,
                    "raw_value": "555",
                    "reference_range": "1 - 999999",
                },
                {
                    "name": "Platelet Count",
                    "value": 150000,
                    "raw_value": "150000",
                    "reference_range": "150000",
                    "source_status": "Normal",
                },
                {
                    "name": "Mindray 300",
                    "value": 300,
                    "raw_value": "300",
                    "reference_range": "1 - 500",
                },
            ],
        }))


class _FakeGemini:
    GenerativeModel = _FakeModel


class ReportExtractionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        sample_path = os.path.join(
            os.path.dirname(__file__),
            "uploads",
            "5817c561ff1646f9aa5776bb15c0c181_sample-report1.pdf",
        )
        cls.report_text = "\n".join(
            page.extract_text() or "" for page in PdfReader(sample_path).pages
        )

    @patch.object(gemini_service, "get_gemini_client", return_value=_FakeGemini)
    def test_ai_results_are_limited_to_source_lab_rows(self, _mock_client):
        extraction = gemini_service.extract_parameters_with_ai(self.report_text)

        self.assertEqual(len(extraction["parameters"]), 14)
        self.assertEqual(
            {normalize_param_key(parameter["name"]) for parameter in extraction["parameters"]},
            {
                "hemoglobin", "rbc", "pcv", "mcv", "mch", "mchc", "rdw", "wbc",
                "neutrophils", "lymphocytes", "eosinophils", "monocytes",
                "basophils", "platelets",
            },
        )
        self.assertEqual(extraction["source_interpretation"], "Further confirm for Anemia")
        self.assertNotIn("PID", {p["name"] for p in extraction["parameters"]})
        self.assertNotIn("Mindray 300", {p["name"] for p in extraction["parameters"]})

    def test_cbc_ranges_and_printed_borderline_status_are_preserved(self):
        extraction = gemini_service.parse_text_heuristically(self.report_text)
        parameters = {
            normalize_param_key(parameter["name"]): parameter
            for parameter in extraction["parameters"]
        }

        self.assertEqual(parameters["mcv"]["reference_range"], "83 - 101")
        self.assertEqual(parameters["mch"]["reference_range"], "27 - 32")
        self.assertEqual(parameters["neutrophils"]["reference_range"], "50 - 62")
        self.assertEqual(parameters["rbc"]["reference_range"], "4.5 - 5.5")

        platelet = evaluate_parameter(
            name=parameters["platelets"]["name"],
            raw_value=parameters["platelets"]["raw_value"],
            custom_unit=parameters["platelets"]["unit"],
            custom_range=parameters["platelets"]["reference_range"],
            source_status=parameters["platelets"]["source_status"],
        )
        self.assertEqual(platelet["status"], "borderline")
        self.assertEqual(platelet["reference_range"], "150000 - 410000")

    def test_labeled_results_require_recognized_test_and_explicit_range(self):
        report = """
PID: 555
Address: 125, Shivam Bungalow, Mumbai
Generated on: 02 Dec, 202X 05:00 PM
Fasting Blood Glucose: 148 mg/dL (Reference Range: 70 - 99 mg/dL)
Random Address Number: 148 mg/dL (Reference Range: 70 - 99 mg/dL)
"""
        extraction = gemini_service.parse_text_heuristically(report)

        self.assertEqual(len(extraction["parameters"]), 1)
        self.assertEqual(extraction["parameters"][0]["name"], "Fasting Blood Glucose")
        self.assertEqual(extraction["parameters"][0]["reference_range"], "70 - 99")


if __name__ == "__main__":
    unittest.main()
