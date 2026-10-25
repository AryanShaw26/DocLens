from typing import List, Dict, Any, Tuple
from app.rules.reference_ranges import normalize_param_key

def detect_concerning_combinations(parameters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Evaluates groups of related parameters to detect patterns warranting clinical attention.
    NON-DIAGNOSTIC: Never states disease or diagnoses.
    """
    param_map: Dict[str, Dict[str, Any]] = {}
    for p in parameters:
        key = normalize_param_key(p["name"])
        param_map[key] = p

    combinations: List[Dict[str, Any]] = []

    # 1. Glycemic & Lipid (Cardiometabolic Risk Pattern)
    has_high_glucose = param_map.get("glucose", {}).get("status") in ["high", "borderline"]
    has_high_hba1c = param_map.get("hba1c", {}).get("status") in ["high", "borderline"]
    has_high_tg = param_map.get("triglycerides", {}).get("status") in ["high", "borderline"]
    has_high_chol = param_map.get("total_cholesterol", {}).get("status") in ["high", "borderline"] or param_map.get("ldl", {}).get("status") in ["high", "borderline"]

    if (has_high_glucose or has_high_hba1c) and (has_high_tg or has_high_chol):
        involved = []
        if has_high_glucose: involved.append("Fasting Glucose")
        if has_high_hba1c: involved.append("HbA1c")
        if has_high_tg: involved.append("Triglycerides")
        if has_high_chol: involved.append("Cholesterol/LDL")

        combinations.append({
            "title": "Combined Glycemic and Lipid Elevation Pattern",
            "description": (
                "Concurrent elevations in blood glucose/HbA1c and lipid markers (triglycerides or cholesterol) "
                "represent a metabolic pattern that may warrant comprehensive medical evaluation, cardiovascular risk review, "
                "and dietary/lifestyle counseling."
            ),
            "review_priority": 30,
            "parameters_involved": involved
        })

    # 2. Dual Hepatic Transaminase Elevation (Liver Stress)
    has_high_alt = param_map.get("alt", {}).get("status") in ["high"]
    has_high_ast = param_map.get("ast", {}).get("status") in ["high"]
    if has_high_alt and has_high_ast:
        involved = ["ALT (SGPT)", "AST (SGOT)"]
        if param_map.get("bilirubin", {}).get("status") in ["high"]:
            involved.append("Total Bilirubin")

        combinations.append({
            "title": "Concurrent Hepatic Enzyme Elevation",
            "description": (
                "Co-elevation of both ALT and AST liver transaminases indicates potential hepatocellular stress. "
                "A qualified medical provider should evaluate these enzyme patterns alongside clinical history and medications."
            ),
            "review_priority": 35,
            "parameters_involved": involved
        })

    # 3. Renal Stress & Nitrogen Retention Pattern
    has_high_creat = param_map.get("creatinine", {}).get("status") in ["high"]
    has_high_bun = param_map.get("bun", {}).get("status") in ["high"] or param_map.get("urea", {}).get("status") in ["high"]
    if has_high_creat and has_high_bun:
        involved = ["Creatinine"]
        if param_map.get("bun", {}).get("status") in ["high"]: involved.append("BUN")
        if param_map.get("urea", {}).get("status") in ["high"]: involved.append("Urea")

        combinations.append({
            "title": "Dual Kidney Function Marker Elevation",
            "description": (
                "Simultaneous elevation in serum creatinine and blood urea/BUN suggests reduced renal clearance capacity. "
                "Professional nephrological review, hydration assessment, and repeat testing are advised."
            ),
            "review_priority": 40,
            "parameters_involved": involved
        })

    # 4. Diabetic-Renal Marker Interplay
    if (has_high_glucose or has_high_hba1c) and (has_high_creat or has_high_bun):
        involved = []
        if has_high_glucose: involved.append("Glucose")
        if has_high_hba1c: involved.append("HbA1c")
        if has_high_creat: involved.append("Creatinine")
        if has_high_bun: involved.append("BUN/Urea")

        combinations.append({
            "title": "Metabolic-Renal Marker Convergence",
            "description": (
                "Co-occurrence of elevated glycemic indicators and elevated kidney clearance parameters warrants "
                "monitoring for microvascular or renal interplay. Professional medical consultation is recommended."
            ),
            "review_priority": 35,
            "parameters_involved": involved
        })

    # 5. Dual Hematologic Lineage Variation (Anemia + Thrombocytopenia/Borderline Platelets)
    has_low_hb = param_map.get("hemoglobin", {}).get("status") in ["low"]
    has_low_plt = param_map.get("platelets", {}).get("status") in ["low", "borderline"]
    if has_low_hb and has_low_plt:
        combinations.append({
            "title": "Dual Hematologic Cell Lineage Variation",
            "description": (
                "Both red blood cell hemoglobin is below reference range and platelet count is in the lower/borderline range. "
                "This combination warrants comprehensive hematological evaluation to investigate potential causes."
            ),
            "review_priority": 35,
            "parameters_involved": ["Hemoglobin", "Platelet Count"]
        })

    # 6. Erythrocytic Index Discordance (Low Hb + High PCV)
    has_high_pcv = param_map.get("pcv", {}).get("status") in ["high"]
    if has_low_hb and has_high_pcv:
        combinations.append({
            "title": "Erythrocytic Index Discordance Pattern",
            "description": (
                "Co-occurrence of an elevated Packed Cell Volume (PCV) with a lower hemoglobin concentration indicates "
                "an altered red cell volume-to-hemoglobin ratio. Clinical evaluation and hydration/red cell correlation are advised."
            ),
            "review_priority": 30,
            "parameters_involved": ["Hemoglobin", "PCV"]
        })

    # 7. Atherogenic Dyslipidemia Pattern (High Triglycerides + Low HDL)
    has_low_hdl = param_map.get("hdl", {}).get("status") in ["low"]
    if has_high_tg and has_low_hdl:
        combinations.append({
            "title": "Atherogenic Dyslipidemic Pattern",
            "description": (
                "Elevated triglycerides accompanied by low protective HDL cholesterol is a recognized pattern "
                "associated with vascular risk factors. Lifestyle and clinical lipid management review may be beneficial."
            ),
            "review_priority": 25,
            "parameters_involved": ["Triglycerides", "HDL Cholesterol"]
        })

    return combinations

def calculate_review_priority(
    parameters: List[Dict[str, Any]],
    combinations: List[Dict[str, Any]]
) -> Tuple[int, str]:
    """
    Calculates a non-diagnostic Review Priority score between 0 and 100.
    Outputs: (score, priority_label)
    Labels:
      0 - 29: Low Review Priority
      30 - 64: Moderate Review Priority
      65 - 100: Higher Review Priority
    """
    base_score = 10  # Baseline baseline attention
    abnormal_weights = {
        "borderline": 5,
        "high": 12,
        "low": 12,
        "unknown": 0
    }
    severity_multipliers = {
        "none": 1.0,
        "mild": 1.0,
        "moderate": 1.25,
        "high": 1.75,
        "critical": 2.2
    }

    param_score = 0
    for p in parameters:
        status = p.get("status", "unknown")
        severity = p.get("severity", "none")
        weight = abnormal_weights.get(status, 0)
        mult = severity_multipliers.get(severity, 1.0)
        param_score += int(weight * mult)

    comb_score = sum(c.get("review_priority", 20) for c in combinations)

    total = base_score + param_score + comb_score
    clamped_score = max(5, min(95, total))

    if clamped_score < 30:
        label = "Low Review Priority"
    elif clamped_score < 65:
        label = "Moderate Review Priority"
    else:
        label = "Higher Review Priority"

    return clamped_score, label

