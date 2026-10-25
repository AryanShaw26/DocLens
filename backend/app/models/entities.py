from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    reports = relationship("MedicalReport", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("ReportComparison", back_populates="user", cascade="all, delete-orphan")
    searches = relationship("HealthcareSearch", back_populates="user", cascade="all, delete-orphan")


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, default=0)
    status = Column(String(50), default="processing")  # uploaded, processing, analyzed, failed
    report_date = Column(String(100), nullable=True)
    patient_name = Column(String(255), nullable=True)
    source_interpretation = Column(Text, nullable=True)  # Verbatim pathologist/laboratory observation
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="reports")
    parameters = relationship("MedicalParameter", back_populates="report", cascade="all, delete-orphan")
    analysis = relationship("AnalysisResult", back_populates="report", uselist=False, cascade="all, delete-orphan")
    abnormalities = relationship("Abnormality", back_populates="report", cascade="all, delete-orphan")
    concerning_combinations = relationship("ConcerningCombination", back_populates="report", cascade="all, delete-orphan")


class MedicalParameter(Base):
    __tablename__ = "medical_parameters"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("medical_reports.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    value = Column(Float, nullable=True)
    raw_value = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    ref_min = Column(Float, nullable=True)
    ref_max = Column(Float, nullable=True)
    status = Column(String(50), default="unknown")  # normal, borderline, high, low, unknown
    severity = Column(String(50), default="none")   # none, mild, moderate, high, critical
    category = Column(String(50), default="other")  # blood, metabolic, lipid, kidney, liver, other
    created_at = Column(DateTime, default=utcnow)

    report = relationship("MedicalReport", back_populates="parameters")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("medical_reports.id"), nullable=False, unique=True, index=True)
    summary = Column(Text, nullable=False)
    review_priority = Column(Integer, default=0)  # 0 to 100
    priority_label = Column(String(100), default="Low")  # Low, Moderate, Higher Review Priority
    processing_metadata = Column(Text, default="{}")
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=utcnow)

    report = relationship("MedicalReport", back_populates="analysis")


class Abnormality(Base):
    __tablename__ = "abnormalities"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("medical_reports.id"), nullable=False, index=True)
    parameter = Column(String(150), nullable=False)
    status = Column(String(50), nullable=False)  # high, low, borderline
    severity = Column(String(50), default="moderate")
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    report = relationship("MedicalReport", back_populates="abnormalities")


class ConcerningCombination(Base):
    __tablename__ = "concerning_combinations"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("medical_reports.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    review_priority = Column(Integer, default=0)
    parameters_involved = Column(Text, default="[]")  # JSON encoded list of parameter names
    created_at = Column(DateTime, default=utcnow)

    report = relationship("MedicalReport", back_populates="concerning_combinations")


class ReportComparison(Base):
    __tablename__ = "report_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    report_a_id = Column(Integer, ForeignKey("medical_reports.id"), nullable=False)
    report_b_id = Column(Integer, ForeignKey("medical_reports.id"), nullable=False)
    summary = Column(Text, nullable=True)
    parameter_diffs = Column(Text, default="[]")  # JSON
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="comparisons")


class HealthcareSearch(Base):
    __tablename__ = "healthcare_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    location_query = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    category = Column(String(50), default="all")
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="searches")

