# MedMitra — AI-Assisted Clinical Documentation & Case-Taking Platform

MedMitra is a clinical documentation platform designed to assist healthcare professionals in capturing, structuring, and reviewing patient medical records.

> **CRITICAL PRODUCT RULES**:
> 1. AI assists the doctor; AI NEVER replaces the doctor.
> 2. AI-generated output is NEVER automatically verified.
> 3. Original patient files remain unchanged in GridFS.
> 4. Tesseract is OCR only (documents/PDFs). Whisper is ASR only (voice audio).

---

## Architecture & AI Services Overview

```
medmitra/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS Frontend
├── backend/              # Node.js + Express + TypeScript Backend
├── ai-service/           # Python FastAPI AI Processing Service
│   └── app/
│       ├── api/v1/       # ASR, OCR, Extraction & Validation Routers
│       ├── schemas/      # Pydantic Request/Response Schemas
│       ├── services/     # Provider Abstractions & Implementations
│       │   ├── asr/      # ASRProvider & WhisperASRProvider (Hugging Face)
│       │   ├── ocr/      # OCRProvider & TesseractOCRProvider
│       │   ├── document_ai/ # DocumentUnderstandingProvider
│       │   ├── extraction/  # ClinicalExtractionSchema & Provenance Engine
│       │   └── validation/  # DeterministicValidator (Non-LLM Rule Engine)
│       └── main.py       # FastAPI Application Entrypoint
├── infrastructure/       # Dockerfiles & Nginx Reverse Proxy Config
├── docker-compose.yml    # Docker Compose Stack (Mongo, Redis, Backend, AI-Service, Frontend, Nginx)
└── README.md
```

---

## AI Processing Pipeline

1. **Patient Upload**: File uploaded to MongoDB GridFS.
2. **BullMQ Queue Dispatch**: Job enqueued in Redis BullMQ `ai-job-queue`.
3. **ASR / OCR Execution**:
   - Voice Audio → Hugging Face Whisper ASR (`POST /api/v1/asr/transcribe`).
   - Image / PDF Document → Tesseract OCR (`POST /api/v1/ocr/process`).
4. **Clinical Extraction**: Text structured into normalized schema with explicit `provenance` (`VOICE`, `OCR`, `DOCUMENT_MODEL`, `PATIENT_ENTERED`).
5. **Deterministic Validation**: Non-LLM rule engine flags missing dosages, suspicious terms, and urgent indicators (`requiresVerification = true`).
6. **Doctor Portal Review**: Physician reviews raw source vs. AI extraction, edits, signs, and approves to create a `VerifiedRecord`.

---

## Quick Start Guide

### Docker Deployment

Start the complete stack (MongoDB, Redis, Express Backend, Vite Frontend, FastAPI AI Service, Nginx):

```bash
docker compose up --build -d
```

- Web Interface (Nginx Proxy): `http://localhost`
- Backend API: `http://localhost/api/v1`
- AI Service API: `http://localhost:8000`
- Swagger UI: `http://localhost/api-docs`

---

## Testing

Run backend integration tests:

```bash
npm test
```
