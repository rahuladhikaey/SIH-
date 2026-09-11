import pytest
from app.services.rag.context_builder import RAGContextBuilder

def test_rag_context_builder_assembly():
    patient_info = {"age": 52, "gender": "male", "medical_history": "Hypertension"}
    clinical_extractions = {
        "chiefComplaint": {"value": "Persistent headache and dizziness"},
        "symptoms": [{"name": "headache", "confidence": 0.95}],
        "medications": [{"name": "Amlodipine", "dosage": "5mg"}]
    }
    validation_results = {
        "requires_verification": True,
        "missing_information_warnings": ["Check medication frequency"],
        "urgent_flag_warnings": ["High Blood Pressure Alert"]
    }
    kb_evidence = [
        {
            "chunk_id": "chk_101",
            "source_doc": "hypertension_guidelines.txt",
            "relevance_score": 0.91,
            "text": "Hypertension is defined as resting blood pressure >= 140/90 mmHg."
        }
    ]

    rag_payload = RAGContextBuilder.build_context(
        patient_info=patient_info,
        clinical_extractions=clinical_extractions,
        validation_results=validation_results,
        kb_evidence=kb_evidence
    )

    assert "system_instruction" in rag_payload
    assert "user_prompt" in rag_payload
    assert "NEVER replace the doctor" in rag_payload["system_instruction"]
    assert "chk_101" in rag_payload["user_prompt"]
    assert len(rag_payload["evidence_chunks"]) == 1
