from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.asr import router as asr_router
from app.api.v1.ocr import router as ocr_router
from app.api.v1.extraction import router as extraction_router
from app.api.v1.summarize import router as summarize_router

app = FastAPI(
    title="MedMitra AI Service",
    description="FastAPI AI Processing Service for MedMitra Clinical Documentation (ASR, OCR, RAG & LLM Summarization)",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "4.0.0",
        "capabilities": ["ASR_Whisper", "OCR_Tesseract", "ClinicalExtraction", "DeterministicValidation", "FAISS_RAG", "LLM_Summarization"]
    }

# Mount Routers under /api/v1
app.include_router(asr_router, prefix="/api/v1")
app.include_router(ocr_router, prefix="/api/v1")
app.include_router(extraction_router, prefix="/api/v1")
app.include_router(summarize_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
