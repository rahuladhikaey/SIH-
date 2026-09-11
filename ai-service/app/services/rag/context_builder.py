import json
from typing import Dict, Any, List

class RAGContextBuilder:
    """
    Assembles controlled prompt context combining Patient Profile, Clinical Extractions,
    Deterministic Validation Alerts, and FAISS Reference Knowledge Evidence.
    """
    
    @staticmethod
    def build_context(
        patient_info: Dict[str, Any],
        clinical_extractions: Dict[str, Any],
        validation_results: Dict[str, Any],
        kb_evidence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Constructs RAG payload with strict instruction parameters for the LLM.
        """
        formatted_evidence = []
        for idx, item in enumerate(kb_evidence):
            formatted_evidence.append({
                "chunk_id": item.get("chunk_id", f"chk_{idx}"),
                "source_doc": item.get("source_doc", "unknown_reference.txt"),
                "relevance_score": round(float(item.get("relevance_score", 0.0)), 4),
                "snippet": item.get("text", "")
            })

        system_instruction = (
            "You are MedMitra AI Clinical Documentation Assistant.\n"
            "CRITICAL RULES:\n"
            "1. You assist the doctor; you NEVER replace the doctor.\n"
            "2. Output MUST be strict valid JSON matching the exact schema requested.\n"
            "3. DO NOT invent or fabricate medical facts not supported by patient data, extractions, or evidence.\n"
            "4. Highlight all low-confidence items or missing medication dosages in 'missing_information'.\n"
            "5. Include evidence_references citing chunk_id and source_doc from the provided knowledge-base evidence.\n"
            "6. You CANNOT set verified status. Output is strictly draft AI_GENERATED summary.\n"
        )

        user_prompt = (
            f"=== PATIENT PROFILE ===\n"
            f"Age: {patient_info.get('age', 'N/A')}, Gender: {patient_info.get('gender', 'N/A')}\n"
            f"Medical History: {patient_info.get('medical_history', 'None reported')}\n\n"
            f"=== CLINICAL EXTRACTION (ASR / OCR Provenance) ===\n"
            f"{json.dumps(clinical_extractions, indent=2)}\n\n"
            f"=== DETERMINISTIC VALIDATION ALERTS ===\n"
            f"Requires Verification: {validation_results.get('requires_verification', False)}\n"
            f"Missing Info Alerts: {validation_results.get('missing_information_warnings', [])}\n"
            f"Urgent Risk Indicators: {validation_results.get('urgent_flag_warnings', [])}\n\n"
            f"=== KNOWLEDGE BASE EVIDENCE (FAISS Retrieved Chunks) ===\n"
            f"{json.dumps(formatted_evidence, indent=2)}\n\n"
            f"Generate a structured clinical summary with patient_overview, current_medications, investigations, "
            f"risk_flags, missing_information, and evidence_references strictly in JSON."
        )

        return {
            "system_instruction": system_instruction,
            "user_prompt": user_prompt,
            "patient_info": patient_info,
            "clinical_extractions": clinical_extractions,
            "validation_results": validation_results,
            "evidence_chunks": formatted_evidence
        }
