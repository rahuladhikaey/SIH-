import pytest
from app.services.llm.llm_provider import MockLLMProvider, get_llm_provider
from app.services.llm.validator import SummaryOutputValidator
from app.services.rag.context_builder import RAGContextBuilder

def test_mock_llm_provider_execution():
    provider = MockLLMProvider()
    rag_context = RAGContextBuilder.build_context(
        patient_info={"age": 45, "gender": "female"},
        clinical_extractions={"chiefComplaint": {"value": "Fever and cough"}},
        validation_results={"requires_verification": False},
        kb_evidence=[{"chunk_id": "chk_1", "source_doc": "guide.txt", "text": "Fever protocol", "relevance_score": 0.88}]
    )

    structured_dict, raw_output, model_info = provider.generate_structured_summary(rag_context)

    assert isinstance(structured_dict, dict)
    assert "patient_overview" in structured_dict
    assert "risk_flags" in structured_dict
    assert "evidence_references" in structured_dict
    assert "provider:mock" in model_info

def test_validator_valid_json():
    valid_json = """
    {
      "patient_overview": "45-year-old female presents with fever.",
      "current_medications": [{"name": "Paracetamol", "dosage": "500mg", "frequency": "BID", "provenance": "VOICE"}],
      "investigations": ["CBC"],
      "risk_flags": [{"severity": "NOTICE", "description": "Fever evaluation", "action_required": "Review"}],
      "missing_information": ["None"],
      "evidence_references": [{"chunk_id": "chk_1", "source_doc": "fever.txt", "snippet": "Fever guide", "relevance_score": 0.9}]
    }
    """
    is_valid, data, err = SummaryOutputValidator.validate_raw_response(valid_json)
    assert is_valid is True
    assert err is None
    assert data["patient_overview"] == "45-year-old female presents with fever."

def test_validator_malformed_json():
    invalid_json = "{ patient_overview: 'missing quotes' "
    is_valid, data, err = SummaryOutputValidator.validate_raw_response(invalid_json)
    assert is_valid is False
    assert "Malformed JSON" in err

def test_validator_missing_required_fields():
    missing_fields_json = """
    {
      "patient_overview": "Missing other required fields"
    }
    """
    is_valid, data, err = SummaryOutputValidator.validate_raw_response(missing_fields_json)
    assert is_valid is False
    assert "JSON Schema validation failure" in err

def test_llm_provider_factory():
    provider = get_llm_provider()
    assert provider is not None
