from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.services.extraction.schema import ClinicalExtractionSchema
from app.services.validation.deterministic import ValidationResult

class ClinicalExtractRequest(BaseModel):
    text: str
    provenance: str = "VOICE" # VOICE | OCR | DOCUMENT_MODEL | PATIENT_ENTERED
    initial_confidence: float = 1.0

class ClinicalExtractResponse(BaseModel):
    status: str = "success"
    extraction: ClinicalExtractionSchema
    validation: ValidationResult
