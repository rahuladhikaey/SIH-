from fastapi import APIRouter
from app.schemas.extraction import ClinicalExtractRequest, ClinicalExtractResponse
from app.services.extraction.schema import extract_clinical_concepts
from app.services.validation.deterministic import DeterministicValidator

router = APIRouter(prefix="/extract", tags=["Clinical Entity Extraction & Validation"])

@router.post("/clinical", response_model=ClinicalExtractResponse)
def extract_clinical(req: ClinicalExtractRequest):
    """
    Extracts clinical entities with explicit provenance, confidence, and requiresVerification flags.
    Executes non-LLM deterministic validation layer.
    """
    schema = extract_clinical_concepts(req.text, provenance=req.provenance, initial_confidence=req.initial_confidence)
    validation = DeterministicValidator.validate(schema)

    return ClinicalExtractResponse(
        status="success",
        extraction=schema,
        validation=validation
    )
