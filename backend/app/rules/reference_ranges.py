import re
from typing import Dict, Any, Tuple, Optional

# Standard reference range knowledge base
# Min, Max, Unit, Category, Severity Thresholds
STANDARD_RANGES: Dict[str, Dict[str, Any]] = {
    # Complete Blood Count (CBC) Parameters
    "hemoglobin": {
        "canonical_name": "Hemoglobin",
        "category": "blood",
        "default_unit": "g/dL",
        "min": 13.0,
        "max": 17.0,
        "critical_low": 8.0,
        "critical_high": 20.0,
        "direction": "both"
    },
    "rbc": {
        "canonical_name": "Total RBC count",
        "category": "blood",
        "default_unit": "mill/cumm",
        "min": 4.5,
        "max": 5.5,
        "direction": "both"
    },
    "pcv": {
        "canonical_name": "PCV",
        "category": "blood",
        "default_unit": "%",
        "min": 40.0,
        "max": 50.0,
        "critical_low": 30.0,
        "critical_high": 55.0,
        "direction": "both"
    },
    "mcv": {
        "canonical_name": "MCV",
        "category": "blood",
        "default_unit": "fL",
        "min": 83.0,
        "max": 101.0,
        "direction": "both"
    },
    "mch": {
        "canonical_name": "MCH",
        "category": "blood",
        "default_unit": "pg",
        "min": 27.0,
        "max": 32.0,
        "direction": "both"
    },
    "mchc": {
        "canonical_name": "MCHC",
        "category": "blood",
        "default_unit": "g/dL",
        "min": 32.5,
        "max": 34.5,
        "direction": "both"
    },
    "rdw": {
        "canonical_name": "RDW",
        "category": "blood",
        "default_unit": "%",
        "min": 11.6,
        "max": 14.0,
        "direction": "high"
    },
    "wbc": {
        "canonical_name": "Total WBC count",
        "category": "blood",
        "default_unit": "cumm",
        "min": 4000.0,
        "max": 11000.0,
        "critical_low": 2000.0,
        "critical_high": 18000.0,
        "direction": "both"
    },
    "neutrophils": {
        "canonical_name": "Neutrophils",
        "category": "blood",
        "default_unit": "%",
        "min": 50.0,
        "max": 62.0,
        "direction": "both"
    },
    "lymphocytes": {
        "canonical_name": "Lymphocytes",
        "category": "blood",
        "default_unit": "%",
        "min": 20.0,
        "max": 40.0,
        "direction": "both"
    },
    "eosinophils": {
        "canonical_name": "Eosinophils",
        "category": "blood",
        "default_unit": "%",
        "min": 0.0,
        "max": 6.0,
        "direction": "high"
    },
    "monocytes": {
        "canonical_name": "Monocytes",
        "category": "blood",
        "default_unit": "%",
        "min": 0.0,
        "max": 10.0,
        "direction": "high"
    },
    "basophils": {
        "canonical_name": "Basophils",
        "category": "blood",
        "default_unit": "%",
        "min": 0.0,
        "max": 2.0,
        "direction": "high"
    },
    "platelets": {
        "canonical_name": "Platelet Count",
        "category": "blood",
        "default_unit": "cumm",
        "min": 150000.0,
        "max": 410000.0,
        "critical_low": 50000.0,
        "direction": "both"
    },

    # Metabolic
    "glucose": {
        "canonical_name": "Fasting Blood Glucose",
        "category": "metabolic",
        "default_unit": "mg/dL",
        "min": 70.0,
        "max": 99.0,
        "borderline_high": 125.0,
        "critical_high": 200.0,
        "critical_low": 55.0,
        "direction": "both"
    },
    "hba1c": {
        "canonical_name": "HbA1c",
        "category": "metabolic",
        "default_unit": "%",
        "min": 4.0,
        "max": 5.6,
        "borderline_high": 6.4,
        "critical_high": 9.0,
        "direction": "high"
    },

    # Lipid
    "total_cholesterol": {
        "canonical_name": "Total Cholesterol",
        "category": "lipid",
        "default_unit": "mg/dL",
        "min": 100.0,
        "max": 199.0,
        "borderline_high": 239.0,
        "critical_high": 300.0,
        "direction": "high"
    },
    "ldl": {
        "canonical_name": "LDL Cholesterol",
        "category": "lipid",
        "default_unit": "mg/dL",
        "min": 50.0,
        "max": 99.0,
        "borderline_high": 159.0,
        "critical_high": 190.0,
        "direction": "high"
    },
    "hdl": {
        "canonical_name": "HDL Cholesterol",
        "category": "lipid",
        "default_unit": "mg/dL",
        "min": 40.0,
        "max": 80.0,
        "critical_low": 30.0,
        "direction": "low"
    },
    "triglycerides": {
        "canonical_name": "Triglycerides",
        "category": "lipid",
        "default_unit": "mg/dL",
        "min": 50.0,
        "max": 149.0,
        "borderline_high": 199.0,
        "critical_high": 400.0,
        "direction": "high"
    },

    # Kidney
    "creatinine": {
        "canonical_name": "Creatinine",
        "category": "kidney",
        "default_unit": "mg/dL",
        "min": 0.6,
        "max": 1.3,
        "borderline_high": 1.5,
        "critical_high": 2.5,
        "direction": "high"
    },
    "bun": {
        "canonical_name": "Blood Urea Nitrogen (BUN)",
        "category": "kidney",
        "default_unit": "mg/dL",
        "min": 7.0,
        "max": 20.0,
        "borderline_high": 25.0,
        "critical_high": 40.0,
        "direction": "high"
    },
    "urea": {
        "canonical_name": "Urea",
        "category": "kidney",
        "default_unit": "mg/dL",
        "min": 15.0,
        "max": 45.0,
        "critical_high": 80.0,
        "direction": "high"
    },

    # Liver
    "alt": {
        "canonical_name": "ALT (SGPT)",
        "category": "liver",
        "default_unit": "U/L",
        "min": 7.0,
        "max": 56.0,
        "critical_high": 150.0,
        "direction": "high"
    },
    "ast": {
        "canonical_name": "AST (SGOT)",
        "category": "liver",
        "default_unit": "U/L",
        "min": 10.0,
        "max": 40.0,
        "critical_high": 120.0,
        "direction": "high"
    },
    "bilirubin": {
        "canonical_name": "Total Bilirubin",
        "category": "liver",
        "default_unit": "mg/dL",
        "min": 0.2,
        "max": 1.2,
        "critical_high": 2.5,
        "direction": "high"
    },
    "alp": {
        "canonical_name": "Alkaline Phosphatase (ALP)",
        "category": "liver",
        "default_unit": "U/L",
        "min": 44.0,
        "max": 147.0,
        "critical_high": 250.0,
        "direction": "high"
    }
}

ALIASES = {
    # CBC Aliases
    "hemoglobin hb": "hemoglobin",
    "hemoglobin": "hemoglobin",
    "hgb": "hemoglobin",
    "hb": "hemoglobin",
    "total rbc count": "rbc",
    "total rbc": "rbc",
    "rbc count": "rbc",
    "red blood cell count": "rbc",
    "rbc": "rbc",
    "packed cell volume pcv": "pcv",
    "packed cell volume": "pcv",
    "pcv": "pcv",
    "hematocrit": "pcv",
    "hct": "pcv",
    "mean corpuscular volume mcv": "mcv",
    "mean corpuscular volume": "mcv",
    "mcv": "mcv",
    "mean corpuscular hemoglobin mch": "mch",
    "mean corpuscular hemoglobin": "mch",
    "mch": "mch",
    "mean corpuscular hemoglobin concentration mchc": "mchc",
    "mean corpuscular hemoglobin concentration": "mchc",
    "mchc": "mchc",
    "red cell distribution width rdw": "rdw",
    "red cell distribution width": "rdw",
    "rdw": "rdw",
    "total wbc count": "wbc",
    "total wbc": "wbc",
    "wbc count": "wbc",
    "white blood cell count": "wbc",
    "white blood cells": "wbc",
    "wbc": "wbc",
    "neutrophils": "neutrophils",
    "lymphocytes": "lymphocytes",
    "eosinophils": "eosinophils",
    "monocytes": "monocytes",
    "basophils": "basophils",
    "platelet count": "platelets",
    "platelets": "platelets",
    "plt": "platelets",

    # Metabolic
    "fbs": "glucose",
    "fasting glucose": "glucose",
    "fasting blood glucose": "glucose",
    "fasting blood sugar": "glucose",
    "blood sugar": "glucose",
    "glycated hemoglobin": "hba1c",
    "a1c": "hba1c",

    # Lipid
    "cholesterol": "total_cholesterol",
    "total cholesterol": "total_cholesterol",
    "ldl-c": "ldl",
    "ldl cholesterol": "ldl",
    "hdl-c": "hdl",
    "hdl cholesterol": "hdl",
    "tg": "triglycerides",

    # Kidney
    "serum creatinine": "creatinine",
    "blood urea nitrogen": "bun",
    "urea": "urea",

    # Liver
    "sgpt": "alt",
    "alt sgpt": "alt",
    "alanine aminotransferase": "alt",
    "sgot": "ast",
    "ast sgot": "ast",
    "aspartate aminotransferase": "ast",
    "total bilirubin": "bilirubin",
    "alkaline phosphatase": "alp",
}

def normalize_param_key(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", name).strip().lower()
    cleaned = re.sub(r"\s+", " ", cleaned)
    if cleaned in ALIASES:
        return ALIASES[cleaned]
    for alias, target in ALIASES.items():
        if alias == cleaned:
            return target
    for alias, target in ALIASES.items():
        if alias in cleaned:
            return target
    for key in STANDARD_RANGES:
        if key in cleaned:
            return key
    return cleaned

def parse_reference_range(range_str: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    if not range_str:
        return None, None
    clean = range_str.replace("–", "-").replace("to", "-").strip()
    matches = re.findall(r"[-+]?\d*\.\d+|\d+", clean)
    if len(matches) >= 2:
        try:
            return float(matches[0]), float(matches[1])
        except ValueError:
            pass
    elif len(matches) == 1:
        try:
            val = float(matches[0])
            if "<" in range_str:
                return 0.0, val
            elif ">" in range_str:
                return val, None
        except ValueError:
            pass
    return None, None

def evaluate_parameter(
    name: str,
    raw_value: str,
    custom_unit: Optional[str] = None,
    custom_range: Optional[str] = None,
    source_status: Optional[str] = None
) -> Dict[str, Any]:
    clean_val = re.findall(r"[-+]?\d*\.\d+|\d+", str(raw_value).replace(",", ""))
    num_val: Optional[float] = float(clean_val[0]) if clean_val else None

    param_key = normalize_param_key(name)
    std_info = STANDARD_RANGES.get(param_key)

    ref_min, ref_max = parse_reference_range(custom_range)
    canonical_name = std_info["canonical_name"] if std_info else name.strip()
    category = std_info["category"] if std_info else "other"
    unit = custom_unit or (std_info["default_unit"] if std_info else "")

    # Preserve report's exact reference range
    if custom_range and custom_range.strip():
        ref_str = custom_range.strip()
    elif ref_min is not None and ref_max is not None:
        ref_str = f"{ref_min} - {ref_max} {unit}".strip()
    elif std_info:
        ref_min = std_info.get("min")
        ref_max = std_info.get("max")
        ref_str = f"{ref_min} - {ref_max} {unit}".strip()
    else:
        ref_str = "N/A"

    if num_val is None:
        return {
            "name": canonical_name,
            "value": None,
            "raw_value": str(raw_value),
            "unit": unit,
            "reference_range": ref_str,
            "ref_min": ref_min,
            "ref_max": ref_max,
            "status": "unknown",
            "severity": "none",
            "category": category,
            "explanation": f"Result '{raw_value}' could not be parsed into a numeric laboratory value."
        }

    status = "normal"
    severity = "none"
    explanation = "This result is within the configured reference range."

    # Normalize source status flag from report if present
    norm_source_flag = (source_status or "").strip().lower()

    if norm_source_flag in ["borderline", "borderline low", "borderline high"]:
        status = "borderline"
        severity = "mild"
        explanation = f"Value is at the reference boundary threshold ({ref_str}) and explicitly marked as Borderline by the laboratory report."
    elif ref_min is not None and ref_max is not None:
        # Check boundary condition
        if num_val < ref_min:
            status = "low"
            if std_info and "critical_low" in std_info and num_val <= std_info["critical_low"]:
                severity = "high"
                explanation = f"Value is substantially below the reference minimum ({ref_min} {unit})."
            elif norm_source_flag == "borderline" or abs(num_val - ref_min) < 1e-4:
                status = "borderline"
                severity = "mild"
                explanation = f"Value is at the lower boundary threshold of the reference range ({ref_min} {unit})."
            else:
                severity = "moderate"
                explanation = f"Value is below the reference minimum ({ref_min} {unit})."
        elif num_val > ref_max:
            status = "high"
            if std_info and "critical_high" in std_info and num_val >= std_info["critical_high"]:
                severity = "high"
                explanation = f"Value is substantially above reference maximum ({ref_max} {unit})."
            elif norm_source_flag == "borderline" or abs(num_val - ref_max) < 1e-4:
                status = "borderline"
                severity = "mild"
                explanation = f"Value is at the upper boundary threshold of the reference range ({ref_max} {unit})."
            else:
                severity = "moderate"
                explanation = f"Value is above the reference maximum ({ref_max} {unit})."
        else:
            # Value is inside [ref_min, ref_max]
            # If value equals ref_min or ref_max and source explicitly marked borderline
            if norm_source_flag == "borderline" or (abs(num_val - ref_min) < 1e-4 and norm_source_flag == "borderline"):
                status = "borderline"
                severity = "mild"
                explanation = f"Value is at the reference boundary ({ref_min} {unit}) and explicitly noted as Borderline by the laboratory report."
            else:
                status = "normal"
                severity = "none"
                explanation = "This result is within the configured reference range."
    elif ref_max is not None and num_val > ref_max:
        status = "high"
        severity = "moderate"
        explanation = f"Value exceeds the reference threshold of {ref_max} {unit}."
    elif ref_min is not None and num_val < ref_min:
        status = "low"
        severity = "moderate"
        explanation = f"Value is below the reference threshold of {ref_min} {unit}."

    return {
        "name": canonical_name,
        "value": num_val,
        "raw_value": str(raw_value),
        "unit": unit,
        "reference_range": ref_str,
        "ref_min": ref_min,
        "ref_max": ref_max,
        "status": status,
        "severity": severity,
        "category": category,
        "explanation": explanation
    }
