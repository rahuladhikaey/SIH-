try:
    import pytest  # type: ignore
except ImportError:
    pytest = None

from app.services.document_ai.hf_doc import HuggingFaceDocumentProvider

def test_document_understanding_sections_and_low_confidence():
    provider = HuggingFaceDocumentProvider()
    raw_ocr = "Rx: Amoxicillin 500mg. Take 1 tablet daily."
    result = provider.analyze_document(raw_ocr)

    assert result.document_type == "prescription"
    assert len(result.sections) > 0
    assert result.overall_confidence > 0.70
    assert result.requires_verification is False

def test_document_understanding_flags_ambiguous_text():
    provider = HuggingFaceDocumentProvider()
    raw_ocr = "Unclear faint handwriting snippet..."
    result = provider.analyze_document(raw_ocr)

    assert result.requires_verification is True
    assert result.overall_confidence < 0.70
