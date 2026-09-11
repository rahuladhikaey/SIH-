from pydantic import BaseModel
from typing import Optional, Dict, Any

class OCRProcessRequest(BaseModel):
    filename: str = "document.pdf"
    doc_ref: Optional[str] = ""

class OCRProcessResponse(BaseModel):
    status: str = "success"
    original_document_ref: str
    raw_ocr_text: str
    confidence: float
    ocr_metadata: Optional[Dict[str, Any]] = None
