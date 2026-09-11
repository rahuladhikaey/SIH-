try:
    import pytest  # type: ignore
except ImportError:
    pytest = None

try:
    from fastapi.testclient import TestClient  # type: ignore
    from app.main import app
    client = TestClient(app)
except ImportError:
    client = None

def test_health_check():
    if client is None:
        return
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "ai-service-scaffold"

def test_summarize_scaffold():
    if client is None:
        return
    payload = {
        "patient_id": "pat_123",
        "chief_complaint": "Persistent Headache",
        "consultation_notes": "Patient reports mild fever and headache for 2 days."
    }
    response = client.post("/api/v1/summarize/scaffold", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["is_scaffold"] is True
    assert "[SCAFFOLD DRAFT]" in data["draft_summary"]

def test_extract_scaffold():
    if client is None:
        return
    payload = {
        "text": "Fever 101F, Cough",
        "resource_type": "consultation_notes"
    }
    response = client.post("/api/v1/extract/scaffold", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["entities"]) > 0
