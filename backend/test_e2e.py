import sys
import os

# Insert backend directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline():
    print("--- 1. Testing Health Endpoint ---", flush=True)
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("Health check OK:", res.json(), flush=True)

    print("\n--- 2. Testing User Registration ---", flush=True)
    reg_payload = {
        "email": "clinical_tester@doclens.ai",
        "password": "SecurePassword123!",
        "full_name": "Dr. Tester"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    if res.status_code == 400 and "already exists" in res.text:
        print("User already registered, proceeding to login...", flush=True)
        login_res = client.post("/api/auth/login", json={
            "email": "clinical_tester@doclens.ai",
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200, login_res.text
        token = login_res.json()["access_token"]
    else:
        assert res.status_code == 200, res.text
        token = res.json()["access_token"]
    print("Auth Token obtained successfully.", flush=True)

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Testing Get Current User Profile ---", flush=True)
    me_res = client.get("/api/users/me", headers=headers)
    assert me_res.status_code == 200, me_res.text
    user_info = me_res.json()
    print("User authenticated:", user_info["email"], user_info["full_name"], flush=True)

    print("\n--- 4. Testing Demo Report Creation & Analysis Engine ---", flush=True)
    demo_res = client.post("/api/reports/demo", headers=headers)
    assert demo_res.status_code == 200, demo_res.text
    report_data = demo_res.json()
    report_id = report_data["id"]
    print(f"Demo Report created with ID: {report_id}", flush=True)
    print(f"Parameters extracted: {len(report_data['parameters'])}", flush=True)
    print(f"Abnormal findings: {len(report_data['abnormalities'])}", flush=True)
    print(f"Concerning combinations: {len(report_data['concerning_combinations'])}", flush=True)
    print(f"Review priority score: {report_data['analysis']['review_priority']} ({report_data['analysis']['priority_label']})", flush=True)
    print(f"AI Summary preview: {report_data['analysis']['summary'][:120]}...", flush=True)

    assert len(report_data["parameters"]) > 5
    assert len(report_data["abnormalities"]) > 0
    assert report_data["analysis"]["review_priority"] > 0
    assert len(report_data["concerning_combinations"]) > 0

    print("\n--- 5. Testing Report Assistant Query ---", flush=True)
    assist_payload = {
        "question": "Explain my abnormal blood glucose and cholesterol in simple terms",
        "history": []
    }
    assist_res = client.post(f"/api/assistant/{report_id}", json=assist_payload, headers=headers)
    assert assist_res.status_code == 200, assist_res.text
    ans_data = assist_res.json()
    print("Assistant Answer Preview:", ans_data["answer"][:140], "...", flush=True)
    assert len(ans_data["answer"]) > 20

    print("\n--- 6. Testing Second Report Creation & Report Comparison ---", flush=True)
    demo_res_2 = client.post("/api/reports/demo", headers=headers)
    report_id_2 = demo_res_2.json()["id"]

    comp_res = client.post("/api/compare", json={
        "report_a_id": report_id,
        "report_b_id": report_id_2
    }, headers=headers)
    assert comp_res.status_code == 200, comp_res.text
    comp_data = comp_res.json()
    print(f"Comparison completed: {comp_data['total_compared']} parameters compared.", flush=True)
    print("Comparison Summary:", comp_data["summary"][:120], "...", flush=True)

    print("\n=================================================", flush=True)
    print("ALL END-TO-END PIPELINE TESTS PASSED FLAWLESSLY!", flush=True)
    print("=================================================", flush=True)

if __name__ == "__main__":
    test_full_pipeline()
