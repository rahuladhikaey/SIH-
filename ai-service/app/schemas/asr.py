from pydantic import BaseModel
from typing import Optional, Dict, Any

class ASRTranscribeRequest(BaseModel):
    filename: str = "recording.wav"
    audio_ref: Optional[str] = ""

class ASRTranscribeResponse(BaseModel):
    status: str = "success"
    original_audio_ref: str
    transcription: str
    detected_language: str
    confidence: float
    raw_provider_output: Optional[Dict[str, Any]] = None
