# MedMitra — Project Status

## Current Phase: Phase 4 — COMPLETE
**Status**: Phase 4 Complete (Knowledge Base, FAISS Vector Retriever & Disk Persistence, Controlled RAG Context Builder, Vendor-Agnostic LLM Provider Abstraction with OpenAI/Anthropic/Mock Support, Strict JSON Schema Output Validation, Summary Storage in `PENDING_REVIEW` State, Doctor Portal RAG & Risk Flags Panels, & Automated Test Suite)

---

### Core Product Guarantees & Safeguards
> **NON-NEGOTIABLE PRODUCT RULES**:
> 1. AI assists the doctor; AI never replaces the doctor.
> 2. AI output is never automatically verified.
> 3. Original patient files remain unchanged in MongoDB GridFS.
> 4. Raw AI output is preserved; low-confidence data is marked `requiresVerification = true`.
> 5. Tesseract is OCR only (images & PDFs). Never used for voice audio.
> 6. Whisper/ASR is voice transcription only. Never used for document OCR.
> 7. Every AI provider uses an abstraction interface (`ASRProvider`, `OCRProvider`, `DocumentUnderstandingProvider`, `LLMProvider`, `EmbeddingProvider`).
> 8. RAG Context (patient info + extractions + validation alerts + FAISS evidence) MUST be supplied to the LLM. LLM never answers from unconstrained knowledge.
> 9. LLM responses are strictly validated against JSON schema; malformed outputs are rejected/retried.
> 10. LLM outputs are strictly stored as `PENDING_REVIEW` and cannot set `VERIFIED` status.

---

## Phase 4 Checklist & Verification Summary

- [x] **Knowledge Base & Chunking**:
  - Reference guidelines created in `ai-service/knowledge-base/` (`hypertension_guidelines.txt`, `diabetes_management.txt`, `antibiotic_dosage_protocols.txt`).
  - Text chunker (`TextChunker`) with metadata attribution, overlapping character splits, and deterministic chunk IDs.
- [x] **Embeddings & FAISS Vector Store**:
  - `EmbeddingProvider` abstraction supporting `MockEmbeddingProvider` (for offline execution & CI) and `HuggingFaceEmbeddingProvider`.
  - `FAISSRetriever` supporting vector index creation, disk persistence (`faiss_index.bin` + `metadata.json`), loading, and top-K similarity search with evidence citations.
- [x] **Controlled RAG Context Builder**:
  - `RAGContextBuilder` assembling patient profile, extractions, deterministic validation alerts, and retrieved FAISS evidence into a constrained system prompt.
- [x] **LLM Provider Abstraction & JSON Schema Validation**:
  - `LLMProvider` interface supporting `OpenAILLMProvider` (`OPENAI_API_KEY`), `AnthropicLLMProvider` (`ANTHROPIC_API_KEY`), and `MockLLMProvider` (`LLM_PROVIDER=mock`).
  - Strict JSON Schema & Pydantic validation via `SummaryOutputValidator`. Rejects malformed JSON, missing fields, or invalid enum types.
- [x] **FastAPI & Queue Integration**:
  - Router `POST /api/v1/summarize/rag` mounted under `/api/v1`.
  - BullMQ pipeline worker (`aiJob.queue.ts`) executes Extraction → Deterministic Validation → RAG Summarization → Saves `AISummary` in `PENDING_REVIEW` state.
- [x] **Doctor Portal UI Enhancements**:
  - **AI Clinical Summary & RAG Evidence Tab**: Structured Patient Overview, Clinical Risk Flags Panel (URGENT/WARNING/NOTICE), and RAG Knowledge Base Evidence Panel (FAISS hits with scores and source document names).
  - Clear `[AI GENERATED - PENDING DOCTOR REVIEW]` safety status badges.
- [x] **Automated Test Suite**:
  - Python tests for chunking (`test_chunking.py`), embeddings (`test_embeddings.py`), FAISS persistence & search (`test_faiss.py`), RAG context (`test_rag.py`), and LLM schema validation (`test_llm.py`).
  - 38 Jest backend integration/unit tests passing 100% across 8 test suites.

---

## Preparation for Phase 5

Phase 5 requires **NO NEW API keys**. It builds upon the existing architecture to finalize doctor case-taking and approval workflows.
