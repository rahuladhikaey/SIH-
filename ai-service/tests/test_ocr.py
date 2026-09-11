try:
    import pytest  # type: ignore
except ImportError:
    pytest = None

from app.services.ocr.tesseract import TesseractOCRProvider

try:
    from fastapi.testclient import TestClient  # type: ignore
    from app.main import app
    client = TestClient(app)
except ImportError:
    client = None

def test_tesseract_ocr_provider_process_image():
    provider = TesseractOCRProvider()
    dummy_image = b"\xff\xd8\xff\xe0\x00\x10JFIF dummy image bytes"
    result = provider.process_image(dummy_image, filename="prescription.jpg", doc_ref="doc_999")

    assert result.original_document_ref == "doc_999"
    assert result.raw_ocr_text is not None
    assert len(result.raw_ocr_text) > 0
    assert result.confidence > 0.0

def test_ocr_endpoint_rejects_audio_file():
    if client is None:
        return
    files = {"file": ("recording.wav", b"RIFF dummy audio bytes", "audio/wav")}
    response = client.post("/api/v1/ocr/process", files=files)
    assert response.status_code == 400
    assert "restricted exclusively to images and PDFs" in response.json()["detail"]
