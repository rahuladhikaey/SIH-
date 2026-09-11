from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class DocumentSection(BaseModel):
    section_name: str
    content: str
    confidence: float = 1.0
    requires_verification: bool = False

class DocumentAnalysisResult(BaseModel):
    document_type: str
    sections: List[DocumentSection]
    overall_confidence: float = 1.0
    requires_verification: bool = False
    metadata: Optional[Dict[str, Any]] = None

class DocumentUnderstandingProvider(ABC):
    @abstractmethod
    def analyze_document(self, raw_ocr_text: str, metadata: Optional[Dict[str, Any]] = None) -> DocumentAnalysisResult:
        """
        Analyze raw OCR text and break into structured document sections.
        """
        pass
