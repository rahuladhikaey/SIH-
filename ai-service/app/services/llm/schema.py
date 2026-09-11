from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MedicationItem(BaseModel):
    name: str
    dosage: Optional[str] = "Requires verification"
    frequency: Optional[str] = "As directed"
    provenance: str = "VOICE"

class RiskFlagItem(BaseModel):
    severity: str = Field(description="URGENT, WARNING, or NOTICE")
    description: str
    action_required: str

class EvidenceReferenceItem(BaseModel):
    chunk_id: str
    source_doc: str
    snippet: str
    relevance_score: float

class AISummarySchema(BaseModel):
    patient_overview: str
    current_medications: List[MedicationItem] = []
    investigations: List[str] = []
    risk_flags: List[RiskFlagItem] = []
    missing_information: List[str] = []
    evidence_references: List[EvidenceReferenceItem] = []

    class Config:
        json_schema_extra = {
            "example": {
                "patient_overview": "45-year-old male with persistent headache and elevated blood pressure.",
                "current_medications": [
                    {"name": "Amlodipine", "dosage": "5mg daily", "frequency": "QD", "provenance": "VOICE"}
                ],
                "investigations": ["ECG", "Serum Electrolytes", "Fasting Blood Glucose"],
                "risk_flags": [
                    {
                        "severity": "URGENT",
                        "description": "Systolic Blood Pressure > 170 mmHg",
                        "action_required": "Immediate triage and monitoring"
                    }
                ],
                "missing_information": ["Medication dosage unconfirmed in voice recording"],
                "evidence_references": [
                    {
                        "chunk_id": "chk_12345",
                        "source_doc": "hypertension_guidelines.txt",
                        "snippet": "Hypertension is defined as resting systolic blood pressure >= 140 mmHg.",
                        "relevance_score": 0.89
                    }
                ]
            }
        }

# JSON Schema dictionary for jsonschema library validation
AI_SUMMARY_JSON_SCHEMA: Dict[str, Any] = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": [
        "patient_overview",
        "current_medications",
        "investigations",
        "risk_flags",
        "missing_information",
        "evidence_references"
    ],
    "properties": {
        "patient_overview": {"type": "string"},
        "current_medications": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name"],
                "properties": {
                    "name": {"type": "string"},
                    "dosage": {"type": "string"},
                    "frequency": {"type": "string"},
                    "provenance": {"type": "string"}
                }
            }
        },
        "investigations": {
            "type": "array",
            "items": {"type": "string"}
        },
        "risk_flags": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["severity", "description", "action_required"],
                "properties": {
                    "severity": {"type": "string", "enum": ["URGENT", "WARNING", "NOTICE"]},
                    "description": {"type": "string"},
                    "action_required": {"type": "string"}
                }
            }
        },
        "missing_information": {
            "type": "array",
            "items": {"type": "string"}
        },
        "evidence_references": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["chunk_id", "source_doc", "snippet", "relevance_score"],
                "properties": {
                    "chunk_id": {"type": "string"},
                    "source_doc": {"type": "string"},
                    "snippet": {"type": "string"},
                    "relevance_score": {"type": "number"}
                }
            }
        }
    }
}
