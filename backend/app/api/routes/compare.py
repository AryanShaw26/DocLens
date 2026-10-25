from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.entities import User
from app.schemas.compare import CompareReportsRequest, CompareReportsResponse
from app.services.analysis_service import compare_two_reports

router = APIRouter(prefix="/compare", tags=["Compare"])

@router.post("", response_model=CompareReportsResponse)
def compare_reports_endpoint(
    req: CompareReportsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return compare_two_reports(
        db=db,
        user_id=current_user.id,
        report_a_id=req.report_a_id,
        report_b_id=req.report_b_id
    )

