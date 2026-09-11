from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional, Dict, Any

class OCRResult(BaseModel):
    original_document_ref: str
    raw_ocr_text: str
    confidence: float = 1.0
    ocr_metadata: Optional[Dict[str, Any]] = None

class OCRProvider(ABC):
    @abstractmethod
    def process_image(self, image_bytes: bytes, filename: str, doc_ref: str = "") -> OCRResult:
        """
        Extract raw OCR text from image/PDF bytes.
        MUST ONLY be used for document images and PDFs. Never for audio!
        """
        pass
