import os
import uuid
import json
import logging
from typing import Optional, Dict, Any, List
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.entities import (
    MedicalReport, MedicalParameter, AnalysisResult, Abnormality, ConcerningCombination
)
from app.rules.reference_ranges import evaluate_parameter
from app.rules.concerning_combinations import detect_concerning_combinations, calculate_review_priority
from app.services.gemini_service import extract_parameters_with_ai, generate_ai_summary

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "txt"}

def validate_and_save_file(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Supported formats: PDF, JPG, JPEG, PNG, TXT."
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    contents = file.file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    return file_path, unique_filename, len(contents), ext

def extract_text_from_file(file_path: str, ext: str) -> str:
    text = ""
    try:
        if ext == "pdf":
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif ext in ["txt"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        else:
            # Images or fallback text placeholder for OCR
            text = f"Medical laboratory diagnostic report image: {os.path.basename(file_path)}"
    except Exception as e:
        logger.warning("Error reading file text (%s). Using document metadata.", e)
    return text

def process_and_save_report(
    db: Session,
    user_id: int,
    file_path: str,
    original_filename: str,
    stored_filename: str,
    file_type: str,
    file_size: int,
    custom_raw_text: Optional[str] = None
) -> MedicalReport:
    """
    Executes the end-to-end report pipeline:
    Extraction -> Validation & Normalization -> Rules -> Combinations -> Priority -> Summary -> DB
    """
    # 1. Create Report in Processing status
    report = MedicalReport(
        user_id=user_id,
        filename=stored_filename,
        original_filename=original_filename,
        file_type=file_type,
        file_size=file_size,
        status="processing"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    try:
        # 2. Extract Text
        report_text = custom_raw_text or extract_text_from_file(file_path, file_type)

        # 3. AI Extraction
        extraction = extract_parameters_with_ai(report_text)
        report.patient_name = extraction.get("patient_name") or "Patient"
        report.report_date = extraction.get("report_date") or "Recently analyzed"
        report.source_interpretation = extraction.get("source_interpretation")

        raw_parameters = extraction.get("parameters", [])

        # 4. Deterministic Reference Range Evaluation & Abnormality Detection
        evaluated_parameters: List[Dict[str, Any]] = []
        abnormalities_list: List[Dict[str, Any]] = []

        for raw_p in raw_parameters:
            eval_res = evaluate_parameter(
                name=raw_p.get("name", ""),
                raw_value=raw_p.get("raw_value") or str(raw_p.get("value", "")),
                custom_unit=raw_p.get("unit"),
                custom_range=raw_p.get("reference_range"),
                source_status=raw_p.get("source_status")
            )
            evaluated_parameters.append(eval_res)

            # Record parameter in DB
            db_param = MedicalParameter(
                report_id=report.id,
                name=eval_res["name"],
                value=eval_res["value"],
                raw_value=eval_res["raw_value"],
                unit=eval_res["unit"],
                reference_range=eval_res["reference_range"],
                ref_min=eval_res["ref_min"],
                ref_max=eval_res["ref_max"],
                status=eval_res["status"],
                severity=eval_res["severity"],
                category=eval_res["category"]
            )
            db.add(db_param)

            # Record abnormality if not normal/unknown
            if eval_res["status"] in ["high", "low", "borderline"]:
                abnormality_item = {
                    "parameter": eval_res["name"],
                    "status": eval_res["status"],
                    "severity": eval_res["severity"],
                    "explanation": eval_res["explanation"]
                }
                abnormalities_list.append(abnormality_item)
                db_abnormality = Abnormality(
                    report_id=report.id,
                    parameter=eval_res["name"],
                    status=eval_res["status"],
                    severity=eval_res["severity"],
                    explanation=eval_res["explanation"]
                )
                db.add(db_abnormality)

        # 5. Concerning Combination Detection
        combinations_list = detect_concerning_combinations(evaluated_parameters)
        for comb in combinations_list:
            db_comb = ConcerningCombination(
                report_id=report.id,
                title=comb["title"],
                description=comb["description"],
                review_priority=comb["review_priority"],
                parameters_involved=json.dumps(comb["parameters_involved"])
            )
            db.add(db_comb)

        # 6. Non-diagnostic Review Priority Calculation
        review_priority, priority_label = calculate_review_priority(
            evaluated_parameters, combinations_list
        )

        # 7. AI Plain-Language Summary
        summary = generate_ai_summary(
            evaluated_parameters,
            abnormalities_list,
            combinations_list,
            review_priority,
            source_interpretation=report.source_interpretation
        )

        # 8. Save Analysis Result
        analysis = AnalysisResult(
            report_id=report.id,
            summary=summary,
            review_priority=review_priority,
            priority_label=priority_label,
            status="completed",
            processing_metadata=json.dumps({
                "parameters_count": len(evaluated_parameters),
                "abnormalities_count": len(abnormalities_list),
                "combinations_count": len(combinations_list),
                "source": "AI + Deterministic Medical Engine"
            })
        )
        db.add(analysis)

        # Update report status
        report.status = "analyzed"
        db.commit()
        db.refresh(report)
        return report

    except Exception as e:
        logger.error("Error processing medical report %s: %s", report.id, e, exc_info=True)
        report.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report processing encountered an error: {str(e)}"
        )

