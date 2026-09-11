try:
    import pytest  # type: ignore
except ImportError:
    pytest = None

from app.services.asr.whisper import WhisperASRProvider

try:
    from fastapi.testclient import TestClient  # type: ignore
    from app.main import app
    client = TestClient(app)
except ImportError:
    client = None

def test_whisper_asr_provider_transcription():
    provider = WhisperASRProvider()
    dummy_audio = b"RIFF_WAV_HEADER_DUMMY_AUDIO_DATA_BYTES"
    result = provider.transcribe(dummy_audio, filename="patient_consultation.wav", audio_ref="rec_123")

    assert result.original_audio_ref == "rec_123"
    assert result.transcription is not None
    assert len(result.transcription) > 0
    assert result.confidence > 0.0
    assert result.detected_language == "en"

def test_asr_endpoint_rejects_document_pdf():
    if client is None:
        return
    files = {"file": ("report.pdf", b"%PDF-1.7 dummy pdf bytes", "application/pdf")}
    response = client.post("/api/v1/asr/transcribe", files=files)
    assert response.status_code == 400
    assert "restricted exclusively to voice recordings" in response.json()["detail"]
