from typing import List, Optional
from pydantic import BaseModel
from app.schemas.report import ReportListItemResponse

class ParameterDelta(BaseModel):
    name: str
    category: str
    unit: Optional[str] = None
    value_a: Optional[float] = None
    value_b: Optional[float] = None
    status_a: str
    status_b: str
    change_type: str  # improved, worsened, unchanged, newly_abnormal, newly_normal, new
    delta: Optional[float] = None
    delta_text: str

class CompareReportsRequest(BaseModel):
    report_a_id: int
    report_b_id: int

class CompareReportsResponse(BaseModel):
    report_a: ReportListItemResponse
    report_b: ReportListItemResponse
    summary: str
    total_compared: int
    improved_count: int
    worsened_count: int
    deltas: List[ParameterDelta]

