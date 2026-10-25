from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User, MedicalReport
from app.schemas.report import AnalysisResultSchema

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.get("/{report_id}", response_model=AnalysisResultSchema)
def get_report_analysis(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.user_id == current_user.id
    ).first()

    if not report or not report.analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found for this report."
        )

    return AnalysisResultSchema(
        id=report.analysis.id,
        summary=report.analysis.summary,
        review_priority=report.analysis.review_priority,
        priority_label=report.analysis.priority_label,
        status=report.analysis.status,
        processing_metadata=report.analysis.processing_metadata,
        created_at=report.analysis.created_at
    )

