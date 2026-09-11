try:
    import pytest  # type: ignore
except ImportError:
    pytest = None
from app.services.extraction.schema import extract_clinical_concepts, ExtractedField
from app.services.validation.deterministic import DeterministicValidator

def test_deterministic_validator_flags_low_confidence_medication():
    text = "Rx: Amoxicillin"
    schema = extract_clinical_concepts(text, provenance="OCR", initial_confidence=0.60)
    validation = DeterministicValidator.validate(schema)

    assert validation.requires_verification is True
    assert len(validation.missing_information_warnings) > 0

def test_deterministic_validator_flags_urgent_chest_pain():
    text = "Patient complains of severe chest pain and shortness of breath."
    schema = extract_clinical_concepts(text, provenance="VOICE", initial_confidence=0.95)
    validation = DeterministicValidator.validate(schema)

    assert validation.requires_verification is True
    assert len(validation.urgent_flag_warnings) > 0
    assert any("URGENT INDICATOR" in warning for warning in validation.urgent_flag_warnings)
