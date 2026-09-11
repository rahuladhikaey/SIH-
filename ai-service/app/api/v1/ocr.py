from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ocr.tesseract import TesseractOCRProvider
from app.schemas.ocr import OCRProcessResponse

router = APIRouter(prefix="/ocr", tags=["OCR Document Text Extraction"])

ocr_provider = TesseractOCRProvider()

@router.post("/process", response_model=OCRProcessResponse)
async def process_document(
    file: UploadFile = File(...),
    doc_ref: str = Form("")
):
    """
    OCR Document Text Extraction Endpoint.
    Uses Tesseract OCR provider. ONLY for images, scanned documents, and PDFs.
    """
    filename = file.filename or "document.pdf"
    ext = filename.lower()

    # Reject audio inputs to strictly enforce OCR rule
    if ext.endswith(".wav") or ext.endswith(".mp3") or ext.endswith(".webm") or ext.endswith(".m4a") or ext.endswith(".ogg"):
        raise HTTPException(
            status_code=400,
            detail="Invalid input for OCR. OCR (Tesseract) is restricted exclusively to images and PDFs. Use /asr/transcribe for voice audio."
        )

    content = await file.read()
    result = ocr_provider.process_image(content, filename=filename, doc_ref=doc_ref)

    return OCRProcessResponse(
        status="success",
        original_document_ref=result.original_document_ref,
        raw_ocr_text=result.raw_ocr_text,
        confidence=result.confidence,
        ocr_metadata=result.ocr_metadata
    )
