from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SummarizeRequest(BaseModel):
    patient_id: str
    consultation_notes: str
    chief_complaint: str
    raw_transcript: Optional[str] = None

class SummarizeResponse(BaseModel):
    status: str
    is_scaffold: bool
    draft_summary: str
    suggested_findings: List[str]
    suggested_diagnosis: List[str]

class ExtractionRequest(BaseModel):
    text: str
    resource_type: str

class ExtractionResponse(BaseModel):
    status: str
    is_scaffold: bool
    entities: List[Dict[str, Any]]
