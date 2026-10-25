from typing import Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.entities import MedicalReport, ReportComparison
from app.schemas.compare import ParameterDelta, CompareReportsResponse
from app.schemas.report import ReportListItemResponse
from app.rules.reference_ranges import normalize_param_key

def compare_two_reports(db: Session, user_id: int, report_a_id: int, report_b_id: int) -> CompareReportsResponse:
    report_a = db.query(MedicalReport).filter(
        MedicalReport.id == report_a_id, MedicalReport.user_id == user_id
    ).first()
    report_b = db.query(MedicalReport).filter(
        MedicalReport.id == report_b_id, MedicalReport.user_id == user_id
    ).first()

    if not report_a or not report_b:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both selected reports could not be found."
        )

    params_a = {normalize_param_key(p.name): p for p in report_a.parameters}
    params_b = {normalize_param_key(p.name): p for p in report_b.parameters}

    all_keys = set(params_a.keys()).union(set(params_b.keys()))
    deltas: List[ParameterDelta] = []
    improved_count = 0
    worsened_count = 0

    for key in sorted(all_keys):
        pa = params_a.get(key)
        pb = params_b.get(key)

        canonical_name = (pb.name if pb else pa.name) if (pb or pa) else key
        category = (pb.category if pb else pa.category) if (pb or pa) else "other"
        unit = (pb.unit if pb else pa.unit) if (pb or pa) else ""

        val_a = pa.value if pa else None
        val_b = pb.value if pb else None
        status_a = pa.status if pa else "unknown"
        status_b = pb.status if pb else "unknown"

        change_type = "unchanged"
        delta = None
        delta_text = "No change"

        if val_a is not None and val_b is not None:
            delta = round(val_b - val_a, 2)
            sign = "+" if delta > 0 else ""
            delta_text = f"{sign}{delta} {unit}".strip()

            if status_a != "normal" and status_b == "normal":
                change_type = "improved"
                improved_count += 1
            elif status_a == "normal" and status_b != "normal":
                change_type = "newly_abnormal"
                worsened_count += 1
            elif status_a in ["high", "low"] and status_b in ["high", "low"]:
                if abs(val_b - (pb.ref_max or 100)) < abs(val_a - (pa.ref_max or 100)):
                    change_type = "improved"
                    improved_count += 1
                else:
                    change_type = "worsened"
                    worsened_count += 1
        elif val_a is None and val_b is not None:
            change_type = "new"
            delta_text = f"New value: {val_b} {unit}".strip()
            if status_b != "normal":
                worsened_count += 1
        elif val_a is not None and val_b is None:
            change_type = "unchanged"
            delta_text = "Not tested in newer report"

        deltas.append(ParameterDelta(
            name=canonical_name,
            category=category,
            unit=unit,
            value_a=val_a,
            value_b=val_b,
            status_a=status_a,
            status_b=status_b,
            change_type=change_type,
            delta=delta,
            delta_text=delta_text
        ))

    summary = (
        f"Comparative review between report from {report_a.report_date or report_a.created_at.strftime('%b %d, %Y')} "
        f"and {report_b.report_date or report_b.created_at.strftime('%b %d, %Y')}. "
        f"A total of {len(deltas)} parameters were evaluated: {improved_count} showed improved or normalized trajectory, "
        f"while {worsened_count} showed newly abnormal or diverging values requiring continued clinical follow-up."
    )

    item_a = ReportListItemResponse(
        id=report_a.id,
        original_filename=report_a.original_filename,
        file_type=report_a.file_type,
        file_size=report_a.file_size,
        status=report_a.status,
        report_date=report_a.report_date,
        patient_name=report_a.patient_name,
        created_at=report_a.created_at,
        review_priority=report_a.analysis.review_priority if report_a.analysis else 0,
        priority_label=report_a.analysis.priority_label if report_a.analysis else "Low",
        abnormalities_count=len(report_a.abnormalities),
        parameters_count=len(report_a.parameters)
    )

    item_b = ReportListItemResponse(
        id=report_b.id,
        original_filename=report_b.original_filename,
        file_type=report_b.file_type,
        file_size=report_b.file_size,
        status=report_b.status,
        report_date=report_b.report_date,
        patient_name=report_b.patient_name,
        created_at=report_b.created_at,
        review_priority=report_b.analysis.review_priority if report_b.analysis else 0,
        priority_label=report_b.analysis.priority_label if report_b.analysis else "Low",
        abnormalities_count=len(report_b.abnormalities),
        parameters_count=len(report_b.parameters)
    )

    return CompareReportsResponse(
        report_a=item_a,
        report_b=item_b,
        summary=summary,
        total_compared=len(deltas),
        improved_count=improved_count,
        worsened_count=worsened_count,
        deltas=deltas
    )

