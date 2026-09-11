from typing import List
from pydantic import BaseModel
from app.services.extraction.schema import ClinicalExtractionSchema, ExtractedField

class ValidationResult(BaseModel):
    is_valid: bool
    requires_verification: bool
    missing_information_warnings: List[str] = []
    suspicious_value_warnings: List[str] = []
    urgent_flag_warnings: List[str] = []

class DeterministicValidator:
    """
    Pure rule-based deterministic validation layer.
    STRICTLY NON-LLM. Validates clinical schema integrity, flags low-confidence terms,
    missing dosages, suspicious parameters, and urgent risk indicators.
    """
    @staticmethod
    def validate(schema: ClinicalExtractionSchema) -> ValidationResult:
        missing_warnings: List[str] = []
        suspicious_warnings: List[str] = []
        urgent_warnings: List[str] = []
        requires_verification = False

        # 1. Validate Medications (Check for missing dosage & low-confidence OCR)
        for med in schema.medications:
            if med.confidence < 0.75:
                missing_warnings.append(f"Medication name '{med.value}' has low confidence ({med.confidence}) — requires verification.")
                med.requiresVerification = True
                requires_verification = True

            # Check for missing dosage (e.g. if med string lacks numbers like 500mg or 10ml)
            if not any(char.isdigit() for char in med.value):
                missing_warnings.append(f"Medication '{med.value}' is missing dosage specification — requires verification.")
                med.requiresVerification = True
                requires_verification = True

        # 2. Validate Symptoms & Risk Flags
        for sym in schema.symptoms:
            if sym.confidence < 0.75:
                suspicious_warnings.append(f"Symptom '{sym.value}' has low extraction confidence ({sym.confidence}).")
                sym.requiresVerification = True
                requires_verification = True

            if "chest pain" in sym.value.lower() or "shortness of breath" in sym.value.lower():
                urgent_warnings.append(f"URGENT INDICATOR DETECTED: {sym.value}. Requires immediate physician evaluation.")
                sym.requiresVerification = True
                requires_verification = True

        for flag in schema.riskFlags:
            urgent_warnings.append(f"RISK FLAG: {flag.value}")
            flag.requiresVerification = True
            requires_verification = True

        # 3. Check for missing chief complaint or vital fields
        if not schema.chiefComplaint or not schema.chiefComplaint.value:
            missing_warnings.append("Chief complaint missing — requires verification.")
            requires_verification = True
            schema.missingInformation.append("Chief complaint requires verification.")

        # Update schema missingInformation list
        schema.missingInformation.extend(missing_warnings)

        return ValidationResult(
            is_valid=len(urgent_warnings) == 0 and len(missing_warnings) == 0,
            requires_verification=requires_verification,
            missing_information_warnings=missing_warnings,
            suspicious_value_warnings=suspicious_warnings,
            urgent_flag_warnings=urgent_warnings,
        )
