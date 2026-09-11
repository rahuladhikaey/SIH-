try:
    import pytest  # type: ignore
except ImportError:
    pytest = None

from app.services.extraction.schema import extract_clinical_concepts

def test_extraction_provenance_and_confidence():
    text = "Patient presents with fever and cough for 3 days. Prescribed Amoxicillin 500mg."
    schema = extract_clinical_concepts(text, provenance="VOICE", initial_confidence=0.95)

    assert schema.chiefComplaint is not None
    assert schema.chiefComplaint.provenance == "VOICE"
    assert schema.chiefComplaint.confidence == 0.95

    assert len(schema.symptoms) > 0
    for sym in schema.symptoms:
        assert sym.provenance == "VOICE"

    assert len(schema.medications) > 0
    assert schema.medications[0].provenance == "VOICE"

def test_extraction_ocr_provenance():
    text = "Rx: Amoxicillin 500mg"
    schema = extract_clinical_concepts(text, provenance="OCR", initial_confidence=0.88)

    assert len(schema.medications) > 0
    assert schema.medications[0].provenance == "OCR"
