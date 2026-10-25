import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User, MedicalReport
from app.schemas.assistant import AssistantQuestionRequest, AssistantQuestionResponse
from app.services.gemini_service import answer_assistant_question

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/{report_id}", response_model=AssistantQuestionResponse)
def ask_assistant_about_report(
    report_id: int,
    req: AssistantQuestionRequest,
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

    # Prepare report context
    parameters_data = [
        {"name": p.name, "value": p.value, "unit": p.unit, "range": p.reference_range, "status": p.status}
        for p in report.parameters
    ]
    abnormalities_data = [
        {"parameter": a.parameter, "status": a.status, "explanation": a.explanation}
        for a in report.abnormalities
    ]
    combinations_data = []
    for c in report.concerning_combinations:
        try:
            inv = json.loads(c.parameters_involved) if c.parameters_involved else []
        except Exception:
            inv = []
        combinations_data.append({"title": c.title, "description": c.description, "parameters": inv})

    report_context = {
        "report_id": report.id,
        "patient_name": report.patient_name,
        "source_interpretation": report.source_interpretation,
        "parameters": parameters_data,
        "abnormalities": abnormalities_data,
        "concerning_combinations": combinations_data,
        "review_priority": report.analysis.review_priority if report.analysis else 0,
        "priority_label": report.analysis.priority_label if report.analysis else "Low"
    }

    history_dicts = [{"role": m.role, "content": m.content} for m in req.history or []]
    result = answer_assistant_question(report_context, req.question, history_dicts)

    return AssistantQuestionResponse(
        answer=result["answer"],
        related_parameters=result.get("related_parameters", []),
        suggested_followups=result.get("suggested_followups", [])
    )

