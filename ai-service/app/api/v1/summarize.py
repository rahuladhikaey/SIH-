from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from app.services.knowledge_base.ingestion import KnowledgeBaseIngestionService
from app.services.rag.context_builder import RAGContextBuilder
from app.services.llm.llm_provider import get_llm_provider
from app.services.llm.validator import SummaryOutputValidator

router = APIRouter(prefix="/summarize", tags=["RAG & LLM Summarization"])

class RAGSummarizeRequest(BaseModel):
    patient_info: Dict[str, Any] = Field(default_factory=dict)
    clinical_extractions: Dict[str, Any] = Field(default_factory=dict)
    validation_results: Dict[str, Any] = Field(default_factory=dict)
    query: Optional[str] = None

class RAGSummarizeResponse(BaseModel):
    status: str = "AI_GENERATED"
    requires_review: bool = True
    verified_record_created: bool = False
    structured_summary: Dict[str, Any]
    evidence_references: List[Dict[str, Any]]
    model_info: str
    original_ai_output: str

kb_service = KnowledgeBaseIngestionService()

@router.post("/rag", response_model=RAGSummarizeResponse, status_code=status.HTTP_200_OK)
def generate_rag_summary(payload: RAGSummarizeRequest):
    """
    Performs FAISS KB similarity search, constructs RAG context, invokes LLM Provider,
    validates output against strict JSON schema, and returns draft AI summary (PENDING_REVIEW).
    """
    try:
        # 1. Determine search query from request or extractions
        search_query = payload.query
        if not search_query:
            chief = payload.clinical_extractions.get("chiefComplaint", {})
            chief_val = chief.get("value", "") if isinstance(chief, dict) else str(chief)
            symptoms = payload.clinical_extractions.get("symptoms", [])
            sym_text = " ".join([s.get("name", "") if isinstance(s, dict) else str(s) for s in symptoms])
            search_query = f"{chief_val} {sym_text}".strip() or "clinical practice guideline management"

        # 2. Query FAISS retriever for top knowledge-base evidence chunks
        retriever = kb_service.get_or_load_retriever()
        kb_evidence = retriever.search(query=search_query, top_k=3)

        # 3. Construct controlled RAG context
        rag_context = RAGContextBuilder.build_context(
            patient_info=payload.patient_info,
            clinical_extractions=payload.clinical_extractions,
            validation_results=payload.validation_results,
            kb_evidence=kb_evidence
        )

        # 4. Invoke LLM Provider abstraction
        provider = get_llm_provider()
        structured_summary, raw_output, model_info = provider.generate_structured_summary(rag_context)

        # 5. Double-check JSON schema validation
        is_valid, validated_dict, err = SummaryOutputValidator.validate_raw_response(raw_output)
        if not is_valid or not validated_dict:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"LLM output rejected due to schema validation error: {err}"
            )

        # Ensure LLM cannot set verified status
        return RAGSummarizeResponse(
            status="AI_GENERATED",
            requires_review=True,
            verified_record_created=False,
            structured_summary=validated_dict,
            evidence_references=validated_dict.get("evidence_references", []),
            model_info=model_info,
            original_ai_output=raw_output
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG summarization failed: {str(e)}"
        )
