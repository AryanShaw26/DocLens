import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User, MedicalReport
from app.rules.reference_ranges import STANDARD_RANGES, normalize_param_key
from app.schemas.report import (
    ReportListItemResponse,
    ReportDetailResponse,
    ParameterSchema,
    AbnormalitySchema,
    CombinationSchema,
    AnalysisResultSchema,
    HealthTrendObservation,
    HealthTrendsResponse,
    ParameterTrendSchema,
    RecentFindingSchema,
    ProgressOverviewSchema,
    ProgressParameterSchema,
    ProgressReportSchema,
    ProgressSummarySchema
)
from app.services.report_service import validate_and_save_file, process_and_save_report

router = APIRouter(prefix="/reports", tags=["Reports"])

def format_report_detail(report: MedicalReport) -> ReportDetailResponse:
    parameters = [
        ParameterSchema(
            id=p.id,
            name=p.name,
            value=p.value,
            raw_value=p.raw_value,
            unit=p.unit,
            reference_range=p.reference_range,
            ref_min=p.ref_min,
            ref_max=p.ref_max,
            status=p.status,
            severity=p.severity,
            category=p.category
        ) for p in report.parameters
    ]

    abnormalities = [
        AbnormalitySchema(
            id=a.id,
            parameter=a.parameter,
            status=a.status,
            severity=a.severity,
            explanation=a.explanation
        ) for a in report.abnormalities
    ]

    combinations = []
    for c in report.concerning_combinations:
        try:
            params_inv = json.loads(c.parameters_involved) if c.parameters_involved else []
        except Exception:
            params_inv = []
        combinations.append(CombinationSchema(
            id=c.id,
            title=c.title,
            description=c.description,
            review_priority=c.review_priority,
            parameters_involved=params_inv
        ))

    analysis = None
    if report.analysis:
        analysis = AnalysisResultSchema(
            id=report.analysis.id,
            summary=report.analysis.summary,
            review_priority=report.analysis.review_priority,
            priority_label=report.analysis.priority_label,
            status=report.analysis.status,
            processing_metadata=report.analysis.processing_metadata,
            created_at=report.analysis.created_at
        )

    return ReportDetailResponse(
        id=report.id,
        original_filename=report.original_filename,
        file_type=report.file_type,
        file_size=report.file_size,
        status=report.status,
        report_date=report.report_date,
        patient_name=report.patient_name,
        source_interpretation=report.source_interpretation,
        notes=report.notes,
        created_at=report.created_at,
        parameters=parameters,
        analysis=analysis,
        abnormalities=abnormalities,
        concerning_combinations=combinations
    )

@router.post("/upload", response_model=ReportDetailResponse)
def upload_report(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_path, unique_filename, file_size, ext = validate_and_save_file(file)

    report = process_and_save_report(
        db=db,
        user_id=current_user.id,
        file_path=file_path,
        original_filename=file.filename or f"report.{ext}",
        stored_filename=unique_filename,
        file_type=ext,
        file_size=file_size
    )

    if notes:
        report.notes = notes
        db.commit()

    return format_report_detail(report)

@router.post("/demo", response_model=ReportDetailResponse)
def create_demo_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    demo_text = """
COMPREHENSIVE METABOLIC & LIPID PANEL
Patient: Jane Doe (Demo Profile)
Date: October 2026
Facility: DocLens Reference Clinical Laboratories

TEST RESULTS:
Fasting Blood Glucose: 148 mg/dL (Reference Range: 70 - 99 mg/dL)
HbA1c: 6.9 % (Reference Range: 4.0 - 5.6 %)
Total Cholesterol: 242 mg/dL (Reference Range: 100 - 199 mg/dL)
Triglycerides: 235 mg/dL (Reference Range: 50 - 149 mg/dL)
HDL Cholesterol: 34 mg/dL (Reference Range: 40 - 80 mg/dL)
LDL Cholesterol: 161 mg/dL (Reference Range: 50 - 99 mg/dL)
Serum Creatinine: 1.05 mg/dL (Reference Range: 0.6 - 1.3 mg/dL)
Blood Urea Nitrogen: 16 mg/dL (Reference Range: 7 - 20 mg/dL)
ALT (SGPT): 42 U/L (Reference Range: 7 - 56 U/L)
AST (SGOT): 36 U/L (Reference Range: 10 - 40 U/L)
Total Bilirubin: 0.8 mg/dL (Reference Range: 0.2 - 1.2 mg/dL)
Hemoglobin: 13.5 g/dL (Reference Range: 12.0 - 17.5 g/dL)
White Blood Cells: 6800 /mcL (Reference Range: 4000 - 11000 /mcL)
Platelet Count: 260000 /mcL (Reference Range: 150000 - 450000 /mcL)
"""
    # Write a temporary demo file
    os.makedirs("./uploads", exist_ok=True)
    demo_filename = "demo_comprehensive_metabolic_panel.txt"
    demo_path = os.path.join("./uploads", demo_filename)
    with open(demo_path, "w", encoding="utf-8") as f:
        f.write(demo_text)

    report = process_and_save_report(
        db=db,
        user_id=current_user.id,
        file_path=demo_path,
        original_filename="Demo_Comprehensive_Panel.pdf",
        stored_filename=demo_filename,
        file_type="txt",
        file_size=len(demo_text),
        custom_raw_text=demo_text
    )

    report.patient_name = "Jane Doe (Demo Profile)"
    report.report_date = "Oct 24, 2026"
    report.notes = "Sample multi-panel test demonstrating glycemic & lipid pattern detection."
    db.commit()

    return format_report_detail(report)

@router.get("", response_model=List[ReportListItemResponse])
def list_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(MedicalReport).filter(
        MedicalReport.user_id == current_user.id
    ).order_by(MedicalReport.created_at.desc()).all()

    items = []
    for r in reports:
        items.append(ReportListItemResponse(
            id=r.id,
            original_filename=r.original_filename,
            file_type=r.file_type,
            file_size=r.file_size,
            status=r.status,
            report_date=r.report_date,
            patient_name=r.patient_name,
            source_interpretation=r.source_interpretation,
            created_at=r.created_at,
            review_priority=r.analysis.review_priority if r.analysis else 0,
            priority_label=r.analysis.priority_label if r.analysis else "Low",
            abnormalities_count=len(r.abnormalities),
            parameters_count=len(r.parameters)
        ))
    return items

@router.get("/trends", response_model=HealthTrendsResponse)
def get_health_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(MedicalReport).options(
        selectinload(MedicalReport.parameters),
        selectinload(MedicalReport.analysis)
    ).filter(
        MedicalReport.user_id == current_user.id
    ).order_by(MedicalReport.created_at.desc(), MedicalReport.id.desc()).all()

    if not reports:
        return HealthTrendsResponse(
            total_reports=0,
            parameters_monitored=0,
            findings_needing_attention=0,
            latest_review_priority=None,
            parameter_trends=[],
            recent_findings=[],
            progress=ProgressOverviewSchema()
        )

    chronological_reports = list(reversed(reports))

    def report_label(report: MedicalReport) -> str:
        return report.report_date or (
            report.created_at.strftime("%d %b, %Y") if report.created_at else "Date unavailable"
        )

    first_report = chronological_reports[0]
    latest_report = reports[0]
    progress_report_fields = {
        "first_report": ProgressReportSchema(id=first_report.id, date=report_label(first_report)),
        "latest_report": ProgressReportSchema(id=latest_report.id, date=report_label(latest_report))
    }
    progress_summary = ProgressSummarySchema()
    progress_parameters = []

    if first_report.id != latest_report.id:
        def by_name(report: MedicalReport):
            return {
                normalize_param_key(parameter.name): parameter
                for parameter in report.parameters
                if parameter.value is not None
            }

        first_parameters = by_name(first_report)
        latest_parameters = by_name(latest_report)
        status_counts = {"improved": 0, "stable": 0, "needs_attention": 0, "insufficient_data": 0}

        for key, first_parameter in first_parameters.items():
            latest_parameter = latest_parameters.get(key)
            if not latest_parameter:
                continue
            first_unit = (first_parameter.unit or "").strip().casefold()
            latest_unit = (latest_parameter.unit or "").strip().casefold()
            if first_unit != latest_unit:
                continue

            first_value = first_parameter.value
            latest_value = latest_parameter.value
            first_min, first_max = first_parameter.ref_min, first_parameter.ref_max
            latest_min, latest_max = latest_parameter.ref_min, latest_parameter.ref_max
            progress_status = "insufficient_data"

            if first_value == latest_value:
                progress_status = "stable"
            elif all(value is not None for value in (first_min, first_max, latest_min, latest_max)):
                def range_distance(value, lower, upper):
                    if value < lower:
                        return lower - value
                    if value > upper:
                        return value - upper
                    return 0.0

                first_distance = range_distance(first_value, first_min, first_max)
                latest_distance = range_distance(latest_value, latest_min, latest_max)
                if first_distance == 0 and latest_distance == 0:
                    progress_status = "stable"
                elif first_distance == 0:
                    progress_status = "needs_attention"
                elif latest_distance == 0:
                    progress_status = "improved"
                else:
                    distance_change = first_distance - latest_distance
                    threshold = abs(first_value) * 0.03
                    if abs(distance_change) <= threshold:
                        progress_status = "stable"
                    elif distance_change > 0:
                        progress_status = "improved"
                    else:
                        progress_status = "needs_attention"

            status_counts[progress_status] += 1
            standard_info = STANDARD_RANGES.get(key)
            progress_parameters.append(ProgressParameterSchema(
                name=(
                    standard_info["canonical_name"]
                    if standard_info else latest_parameter.name
                ),
                first_value=first_value,
                latest_value=latest_value,
                unit=latest_parameter.unit,
                ref_min=latest_min,
                ref_max=latest_max,
                first_ref_min=first_min,
                first_ref_max=first_max,
                change=latest_value - first_value,
                direction=(
                    "up" if latest_value > first_value
                    else "down" if latest_value < first_value
                    else "stable"
                ),
                progress_status=progress_status
            ))

        if status_counts["improved"] > status_counts["needs_attention"]:
            overall = "improving"
        elif status_counts["needs_attention"] > status_counts["improved"]:
            overall = "needs_attention"
        elif status_counts["stable"] > 0:
            overall = "stable"
        else:
            overall = "insufficient_data"
        progress_summary = ProgressSummarySchema(**status_counts, overall=overall)

    progress = ProgressOverviewSchema(
        **progress_report_fields,
        parameters=progress_parameters,
        summary=progress_summary
    )

    parameter_groups = {}
    parameter_names = set()
    for report in chronological_reports:
        report_date = report_label(report)
        for parameter in report.parameters:
            key = normalize_param_key(parameter.name)
            parameter_names.add(key)
            group = parameter_groups.setdefault(key, {
                "name": parameter.name,
                "unit": parameter.unit,
                "observations": []
            })
            if parameter.value is not None:
                group["observations"].append(HealthTrendObservation(
                    report_id=report.id,
                    date=report_date,
                    value=parameter.value,
                    status=parameter.status,
                    ref_min=parameter.ref_min,
                    ref_max=parameter.ref_max
                ))

    preferred_keys = ["hemoglobin", "platelets", "pcv", "mcv"]
    ordered_keys = [key for key in preferred_keys if key in parameter_groups]
    ordered_keys.extend(
        key for key in parameter_groups if key not in ordered_keys
    )

    parameter_trends = []
    for key in ordered_keys[:4]:
        group = parameter_groups[key]
        observations = group["observations"]
        trend = "insufficient_data"
        if len(observations) >= 2:
            previous = observations[-2].value
            current = observations[-1].value
            if previous is not None and current is not None:
                difference_percentage = (
                    abs(current - previous) / abs(previous) * 100
                    if previous != 0 else (0 if current == 0 else 100)
                )
                if difference_percentage < 3:
                    trend = "stable"
                elif current > previous:
                    trend = "up"
                else:
                    trend = "down"

        standard_info = STANDARD_RANGES.get(key)
        parameter_trends.append(ParameterTrendSchema(
            name=standard_info["canonical_name"] if standard_info else group["name"],
            unit=group["unit"],
            observations=observations,
            trend=trend
        ))

    latest_report = reports[0]
    attention_statuses = {"high", "low", "borderline"}
    recent_findings = [
        RecentFindingSchema(
            parameter=parameter.name,
            value=parameter.value,
            raw_value=parameter.raw_value,
            unit=parameter.unit,
            status=parameter.status,
            severity=parameter.severity,
            reference_range=parameter.reference_range
        )
        for report in reports
        for parameter in report.parameters
        if (parameter.status or "").lower() in attention_statuses
    ][:5]

    return HealthTrendsResponse(
        total_reports=len(reports),
        parameters_monitored=len(parameter_names),
        findings_needing_attention=sum(
            1 for parameter in latest_report.parameters
            if (parameter.status or "").lower() in attention_statuses
        ),
        latest_review_priority=(
            latest_report.analysis.review_priority if latest_report.analysis else None
        ),
        parameter_trends=parameter_trends,
        recent_findings=recent_findings,
        progress=progress
    )

@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )

    return format_report_detail(report)

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found."
        )

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully.", "id": report_id}
