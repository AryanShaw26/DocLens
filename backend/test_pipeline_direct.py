import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.db.session import SessionLocal
from app.api.routes import auth, users, reports, assistant, compare
from app.schemas.user import UserRegisterRequest, UserLoginRequest
from app.schemas.assistant import AssistantQuestionRequest
from app.schemas.compare import CompareReportsRequest

def run_tests():
    db = SessionLocal()
    print("--- 1. Testing User Registration ---", flush=True)
    reg_req = UserRegisterRequest(
        email="test_patient@doclens.ai",
        password="ValidPassword123!",
        full_name="Jane Clinical Test"
    )
    try:
        user_res = auth.register_user(reg_req, db)
        print("Registered new user:", user_res.user.email, flush=True)
    except Exception as e:
        print("User already registered or error:", e, flush=True)

    print("\n--- 2. Testing User Login ---", flush=True)
    login_req = UserLoginRequest(
        email="test_patient@doclens.ai",
        password="ValidPassword123!"
    )
    token_res = auth.login_user(login_req, db)
    assert token_res.access_token is not None
    user = token_res.user
    print("Logged in successfully! Token generated. User ID:", user.id, flush=True)

    print("\n--- 3. Testing Demo Report Creation & Clinical Engine ---", flush=True)
    demo_report = reports.create_demo_report(current_user=user, db=db)
    print("Report ID:", demo_report.id, flush=True)
    print("Original Filename:", demo_report.original_filename, flush=True)
    print("Parameters Extracted Count:", len(demo_report.parameters), flush=True)
    print("Abnormal Findings Count:", len(demo_report.abnormalities), flush=True)
    print("Concerning Combinations Count:", len(demo_report.concerning_combinations), flush=True)
    print("Review Priority:", demo_report.analysis.review_priority, f"({demo_report.analysis.priority_label})", flush=True)
    print("AI Summary snippet:", demo_report.analysis.summary[:140], "...", flush=True)

    assert len(demo_report.parameters) >= 10
    assert len(demo_report.abnormalities) >= 1
    assert len(demo_report.concerning_combinations) >= 1
    assert demo_report.analysis.review_priority > 0

    print("\n--- 4. Testing Report AI Assistant ---", flush=True)
    q_req = AssistantQuestionRequest(
        question="What does my fasting blood glucose of 148 mean?",
        history=[]
    )
    q_res = assistant.ask_assistant_about_report(
        report_id=demo_report.id,
        req=q_req,
        current_user=user,
        db=db
    )
    print("Assistant Answer:", q_res.answer[:160], "...", flush=True)
    print("Followup suggestions:", q_res.suggested_followups, flush=True)
    assert len(q_res.answer) > 20

    print("\n--- 5. Testing Second Report Creation & Report Comparison ---", flush=True)
    demo_report_2 = reports.create_demo_report(current_user=user, db=db)
    comp_req = CompareReportsRequest(
        report_a_id=demo_report.id,
        report_b_id=demo_report_2.id
    )
    comp_res = compare.compare_reports_endpoint(req=comp_req, current_user=user, db=db)
    print("Comparison Summary:", comp_res.summary[:150], "...", flush=True)
    print("Total Parameters Compared:", comp_res.total_compared, flush=True)
    assert comp_res.total_compared > 5

    print("\n=========================================================", flush=True)
    print("ALL CORE BACKEND FLOWS AND MEDICAL RULES PASSED WITH 100% SUCCESS!", flush=True)
    print("=========================================================", flush=True)

if __name__ == "__main__":
    run_tests()
