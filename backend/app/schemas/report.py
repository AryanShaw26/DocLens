from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class ParameterSchema(BaseModel):
    id: Optional[int] = None
    name: str
    value: Optional[float] = None
    raw_value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    status: str = "unknown"  # normal, borderline, high, low, unknown
    severity: str = "none"   # none, mild, moderate, high, critical
    category: str = "other"  # blood, metabolic, lipid, kidney, liver, other

    class Config:
        from_attributes = True

class AbnormalitySchema(BaseModel):
    id: Optional[int] = None
    parameter: str
    status: str
    severity: str
    explanation: str

    class Config:
        from_attributes = True

class CombinationSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    review_priority: int
    parameters_involved: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True

class AnalysisResultSchema(BaseModel):
    id: Optional[int] = None
    summary: str
    review_priority: int
    priority_label: str
    status: str
    processing_metadata: Optional[str] = "{}"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReportListItemResponse(BaseModel):
    id: int
    original_filename: str
    file_type: str
    file_size: int
    status: str
    report_date: Optional[str] = None
    patient_name: Optional[str] = None
    source_interpretation: Optional[str] = Field(
        default=None,
        description="Verbatim source-provided laboratory interpretation, not an AI diagnosis."
    )
    created_at: datetime
    review_priority: Optional[int] = 0
    priority_label: Optional[str] = "Low"
    abnormalities_count: int = 0
    parameters_count: int = 0

    class Config:
        from_attributes = True

class ReportDetailResponse(BaseModel):
    id: int
    original_filename: str
    file_type: str
    file_size: int
    status: str
    report_date: Optional[str] = None
    patient_name: Optional[str] = None
    source_interpretation: Optional[str] = Field(
        default=None,
        description="Verbatim source-provided laboratory interpretation, not an AI diagnosis."
    )
    notes: Optional[str] = None
    created_at: datetime
    parameters: List[ParameterSchema] = Field(default_factory=list)
    analysis: Optional[AnalysisResultSchema] = None
    abnormalities: List[AbnormalitySchema] = Field(default_factory=list)
    concerning_combinations: List[CombinationSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True

class HealthTrendObservation(BaseModel):
    report_id: int
    date: str
    value: Optional[float] = None
    status: str
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None

class ProgressReportSchema(BaseModel):
    id: int
    date: str

class ProgressParameterSchema(BaseModel):
    name: str
    first_value: float
    latest_value: float
    unit: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    first_ref_min: Optional[float] = None
    first_ref_max: Optional[float] = None
    change: float
    direction: str
    progress_status: str

class ProgressSummarySchema(BaseModel):
    improved: int = 0
    stable: int = 0
    needs_attention: int = 0
    insufficient_data: int = 0
    overall: str = "insufficient_data"

class ProgressOverviewSchema(BaseModel):
    first_report: Optional[ProgressReportSchema] = None
    latest_report: Optional[ProgressReportSchema] = None
    parameters: List[ProgressParameterSchema] = Field(default_factory=list)
    summary: ProgressSummarySchema = Field(default_factory=ProgressSummarySchema)

class ParameterTrendSchema(BaseModel):
    name: str
    unit: Optional[str] = None
    observations: List[HealthTrendObservation] = Field(default_factory=list)
    trend: str

class RecentFindingSchema(BaseModel):
    parameter: str
    value: Optional[float] = None
    raw_value: str
    unit: Optional[str] = None
    status: str
    severity: str
    reference_range: Optional[str] = None

class HealthTrendsResponse(BaseModel):
    total_reports: int
    parameters_monitored: int
    findings_needing_attention: int
    latest_review_priority: Optional[int] = None
    parameter_trends: List[ParameterTrendSchema] = Field(default_factory=list)
    recent_findings: List[RecentFindingSchema] = Field(default_factory=list)
    progress: ProgressOverviewSchema = Field(default_factory=ProgressOverviewSchema)

class ManualReportCreateRequest(BaseModel):
    patient_name: Optional[str] = "Patient"
    report_date: Optional[str] = None
    parameters: List[ParameterSchema]
