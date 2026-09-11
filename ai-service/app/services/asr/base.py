from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional, Dict, Any

class ASRResult(BaseModel):
    original_audio_ref: str
    transcription: str
    detected_language: str = "en"
    confidence: float = 1.0
    raw_provider_output: Optional[Dict[str, Any]] = None

class ASRProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_bytes: bytes, filename: str, audio_ref: str = "", client_transcript: str = "") -> ASRResult:
        """
        Transcribe audio bytes into text.
        Must ONLY be used for voice recordings.
        """
        pass
