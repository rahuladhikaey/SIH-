from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.asr.whisper import WhisperASRProvider
from app.schemas.asr import ASRTranscribeResponse

router = APIRouter(prefix="/asr", tags=["ASR Voice Transcription"])

asr_provider = WhisperASRProvider()

@router.post("/transcribe", response_model=ASRTranscribeResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    audio_ref: str = Form(""),
    client_transcript: str = Form("")
):
    """
    ASR Voice Transcription Endpoint.
    Uses Whisper ASR provider. ONLY for audio files.
    """
    filename = file.filename or "recording.wav"
    ext = filename.lower()
    
    # Reject non-audio inputs to strictly enforce ASR rule
    if ext.endswith(".pdf") or ext.endswith(".jpg") or ext.endswith(".png"):
        raise HTTPException(
            status_code=400,
            detail="Invalid input for ASR. ASR (Whisper) is restricted exclusively to voice recordings. Use /ocr/process for documents and images."
        )

    content = await file.read()
    result = asr_provider.transcribe(content, filename=filename, audio_ref=audio_ref, client_transcript=client_transcript)

    return ASRTranscribeResponse(
        status="success",
        original_audio_ref=result.original_audio_ref,
        transcription=result.transcription,
        detected_language=result.detected_language,
        confidence=result.confidence,
        raw_provider_output=result.raw_provider_output
    )
