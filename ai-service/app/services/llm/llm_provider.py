import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
import httpx

from app.services.llm.validator import SummaryOutputValidator

class LLMProvider(ABC):
    """Abstract interface for LLM Clinical Summarization providers."""

    @abstractmethod
    def generate_structured_summary(self, rag_context: Dict[str, Any]) -> Tuple[Dict[str, Any], str, str]:
        """
        Executes LLM completion, validates response against JSON schema.
        
        Returns:
            (structured_dict, raw_response_text, model_info)
        """
        pass


class MockLLMProvider(LLMProvider):
    """
    Deterministic Mock LLM Provider for offline CI testing and development.
    Generates fully compliant structured summaries based on RAG context.
    """
    def __init__(self, model_name: str = "mock-gpt-4o-mini"):
        self.model_name = model_name

    def generate_structured_summary(self, rag_context: Dict[str, Any]) -> Tuple[Dict[str, Any], str, str]:
        patient_info = rag_context.get("patient_info", {})
        clinical_extractions = rag_context.get("clinical_extractions", {})
        validation_results = rag_context.get("validation_results", {})
        evidence_chunks = rag_context.get("evidence_chunks", [])
        user_prompt = rag_context.get("user_prompt", "")

        # Extract text from chief complaint or user prompt
        chief_complaint = clinical_extractions.get("chiefComplaint", {})
        if isinstance(chief_complaint, dict):
            chief_text = chief_complaint.get("value") or chief_complaint.get("name") or ""
        else:
            chief_text = str(chief_complaint) if chief_complaint else ""

        full_text = f"{chief_text} {user_prompt}".strip()

        # Dynamic symptom & risk extraction
        extracted_symptoms = []
        for s in clinical_extractions.get("symptoms", []):
            val = (s.get("value") or s.get("name") or str(s)) if isinstance(s, dict) else str(s)
            if val and val not in extracted_symptoms:
                extracted_symptoms.append(val)

        # Keyword based fallback extraction from raw speech if empty
        lower_text = full_text.lower()
        if "migraine" in lower_text and "Migraine" not in extracted_symptoms:
            extracted_symptoms.append("Severe Migraine Headache")
        if "headache" in lower_text and "Headache" not in extracted_symptoms:
            extracted_symptoms.append("Headache")
        if "fever" in lower_text and "Fever" not in extracted_symptoms:
            extracted_symptoms.append("Fever")
        if "eye" in lower_text or "vision" in lower_text:
            extracted_symptoms.append("Visual Disturbance / Eye Power Concern")

        symptom_summary = ", ".join(extracted_symptoms) if extracted_symptoms else "Symptomatic evaluation"

        if full_text:
            overview = (
                f"Patient Clinical Statement: \"{full_text[:250]}\". "
                f"Structured Clinical Findings: {symptom_summary}. "
                f"Attending physician review & verification required prior to finalizing treatment plan."
            )
        else:
            overview = (
                f"Patient ({patient_info.get('age', 'N/A')} y/o {patient_info.get('gender', 'patient')}) "
                f"presents for clinical evaluation of {symptom_summary}. "
                f"Requires physician verification of extractions."
            )

        medications = []
        for med in clinical_extractions.get("medications", []):
            if isinstance(med, dict):
                medications.append({
                    "name": med.get("name", "Unknown Medication"),
                    "dosage": med.get("dosage", "Requires verification"),
                    "frequency": med.get("frequency", "As directed"),
                    "provenance": med.get("provenance", "VOICE")
                })

        risk_flags = []
        if "migraine" in lower_text or "headache" in lower_text:
            risk_flags.append({
                "severity": "URGENT",
                "description": "Acute severe headache / migraine reported by patient.",
                "action_required": "Evaluate neurological symptoms, blood pressure, and visual acuity."
            })
        if "eye" in lower_text or "power" in lower_text:
            risk_flags.append({
                "severity": "WARNING",
                "description": "Patient reported vision / eye power concerns.",
                "action_required": "Recommend ophthalmological consultation & refractometry."
            })

        if not risk_flags:
            risk_flags.append({
                "severity": "NOTICE",
                "description": "AI clinical summary generated from voice statement.",
                "action_required": "Review extraction accuracy prior to approval."
            })

        missing_info = validation_results.get("missing_information_warnings", [])
        if not missing_info:
            missing_info = ["Confirm symptom onset, duration, and prior medication history."]

        evidence_refs = []
        for chk in evidence_chunks:
            evidence_refs.append({
                "chunk_id": chk.get("chunk_id", "chk_mock"),
                "source_doc": chk.get("source_doc", "reference.txt"),
                "snippet": chk.get("snippet", "")[:150],
                "relevance_score": float(chk.get("relevance_score", 0.85))
            })

        mock_payload = {
            "patient_overview": overview,
            "current_medications": medications,
            "investigations": ["Neurological Screen", "Ophthalmological Evaluation", "Routine Blood Count"],
            "risk_flags": risk_flags,
            "missing_information": missing_info,
            "evidence_references": evidence_refs
        }

        raw_json_str = json.dumps(mock_payload, indent=2)
        is_valid, validated_dict, err = SummaryOutputValidator.validate_raw_response(raw_json_str)

        if not is_valid or validated_dict is None:
            raise ValueError(f"Mock LLM failed schema validation: {err}")

        return validated_dict, raw_json_str, f"provider:mock/{self.model_name}"


class GeminiLLMProvider(LLMProvider):
    """
    Google Gemini LLM Provider using Generative Language REST API.
    Supports gemini-3.6-flash, gemini-flash-latest, gemini-2.5-flash-lite with structured JSON output.
    """
    def __init__(self, model_name: str = "gemini-3.6-flash", api_key: str = None):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY", "")
        self.fallback_provider = MockLLMProvider()

    def generate_structured_summary(self, rag_context: Dict[str, Any]) -> Tuple[Dict[str, Any], str, str]:
        if not self.api_key:
            return self.fallback_provider.generate_structured_summary(rag_context)

        system_instruction = rag_context.get("system_instruction", "")
        user_prompt = rag_context.get("user_prompt", "")

        candidate_models = [
            self.model_name,
            "gemini-3.6-flash",
            "gemini-flash-latest",
            "gemini-2.5-flash-lite",
            "gemini-1.5-flash"
        ]

        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(candidate_models))

        headers = {"Content-Type": "application/json"}
        combined_prompt = f"System Instruction:\n{system_instruction}\n\nUser Request:\n{user_prompt}"

        payload = {
            "contents": [
                {
                    "parts": [{"text": combined_prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                with httpx.Client(timeout=30.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_content = data["candidates"][0]["content"]["parts"][0]["text"]
                        is_valid, validated_dict, err = SummaryOutputValidator.validate_raw_response(raw_content)
                        if is_valid and validated_dict:
                            return validated_dict, raw_content, f"provider:gemini/{model}"
            except Exception:
                pass

        return self.fallback_provider.generate_structured_summary(rag_context)


class OpenAILLMProvider(LLMProvider):
    """
    OpenAI LLM Provider using Chat Completions API with structured JSON output mode.
    Reads credentials strictly from OPENAI_API_KEY environment variable.
    """
    def __init__(self, model_name: str = "gpt-4o-mini", api_key: str = None):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.fallback_provider = MockLLMProvider()

    def generate_structured_summary(self, rag_context: Dict[str, Any]) -> Tuple[Dict[str, Any], str, str]:
        if not self.api_key or self.api_key.startswith("AIza") or self.api_key.startswith("AQ."):
            # If key is a Gemini API key or missing, route to Gemini or fallback
            return GeminiLLMProvider(api_key=self.api_key).generate_structured_summary(rag_context)

        system_instruction = rag_context.get("system_instruction", "")
        user_prompt = rag_context.get("user_prompt", "")

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        # Attempt API call with retries
        for attempt in range(2):
            try:
                with httpx.Client(timeout=30.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_content = data["choices"][0]["message"]["content"]
                        is_valid, validated_dict, err = SummaryOutputValidator.validate_raw_response(raw_content)
                        if is_valid and validated_dict:
                            return validated_dict, raw_content, f"provider:openai/{self.model_name}"
            except Exception:
                pass

        # Fallback to mock provider if OpenAI API fails or is unreachable
        return self.fallback_provider.generate_structured_summary(rag_context)


class AnthropicLLMProvider(LLMProvider):
    """
    Anthropic Claude LLM Provider using Messages API.
    Reads credentials strictly from ANTHROPIC_API_KEY environment variable.
    """
    def __init__(self, model_name: str = "claude-3-haiku-20240307", api_key: str = None):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.fallback_provider = MockLLMProvider()

    def generate_structured_summary(self, rag_context: Dict[str, Any]) -> Tuple[Dict[str, Any], str, str]:
        if not self.api_key:
            return self.fallback_provider.generate_structured_summary(rag_context)

        system_instruction = rag_context.get("system_instruction", "")
        user_prompt = rag_context.get("user_prompt", "")

        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "max_tokens": 2048,
            "system": system_instruction,
            "messages": [{"role": "user", "content": user_prompt}],
            "temperature": 0.2
        }

        for attempt in range(2):
            try:
                with httpx.Client(timeout=30.0) as client:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_content = data["content"][0]["text"]
                        is_valid, validated_dict, err = SummaryOutputValidator.validate_raw_response(raw_content)
                        if is_valid and validated_dict:
                            return validated_dict, raw_content, f"provider:anthropic/{self.model_name}"
            except Exception:
                pass

        return self.fallback_provider.generate_structured_summary(rag_context)


def get_llm_provider() -> LLMProvider:
    """Factory selecting LLM provider based on environment variables."""
    provider_name = os.getenv("LLM_PROVIDER", "mock").lower()
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    if provider_name == "gemini" or gemini_key or openai_key.startswith("AIza") or openai_key.startswith("AQ."):
        return GeminiLLMProvider()
    elif provider_name == "openai":
        return OpenAILLMProvider()
    elif provider_name == "anthropic":
        return AnthropicLLMProvider()
    return MockLLMProvider()
