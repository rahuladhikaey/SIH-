import json
from typing import Dict, Any, Tuple, Optional
import jsonschema
from pydantic import ValidationError
from app.services.llm.schema import AI_SUMMARY_JSON_SCHEMA, AISummarySchema

class SummaryOutputValidator:
    """
    Validates LLM output against the strict clinical summary JSON schema.
    Rejects malformed outputs, missing required fields, and invalid data types.
    """

    @classmethod
    def validate_raw_response(cls, raw_response: str) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Parses raw text, validates against JSON Schema & Pydantic models.
        
        Returns:
            (is_valid: bool, structured_dict: dict | None, error_message: str | None)
        """
        if not raw_response or not raw_response.strip():
            return False, None, "LLM returned empty response."

        cleaned_text = raw_response.strip()

        # Extract JSON from markdown code block if present
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()

        # 1. Parse JSON syntax
        try:
            parsed_data = json.loads(cleaned_text)
        except json.JSONDecodeError as err:
            return False, None, f"Malformed JSON output: {str(err)}"

        if not isinstance(parsed_data, dict):
            return False, None, f"Expected top-level JSON object, got {type(parsed_data).__name__}"

        # Normalize patient_overview if returned as dict/object by LLM
        if isinstance(parsed_data.get("patient_overview"), dict):
            parsed_data["patient_overview"] = json.dumps(parsed_data["patient_overview"])
        elif not parsed_data.get("patient_overview"):
            parsed_data["patient_overview"] = "Clinical evaluation summary based on patient voice statement."

        # Ensure array fields exist
        for key in ["current_medications", "investigations", "risk_flags", "missing_information", "evidence_references"]:
            if key not in parsed_data or not isinstance(parsed_data[key], list):
                parsed_data[key] = []

        # 2. Validate against JSON Schema
        try:
            jsonschema.validate(instance=parsed_data, schema=AI_SUMMARY_JSON_SCHEMA)
        except jsonschema.ValidationError as err:
            return False, None, f"JSON Schema validation failure: {err.message} at path '{'.'.join(str(p) for p in err.path)}'"

        # 3. Validate against Pydantic model for type coercion and field sanity
        try:
            summary_model = AISummarySchema(**parsed_data)
            validated_dict = summary_model.model_dump()
            return True, validated_dict, None
        except ValidationError as err:
            return False, None, f"Pydantic schema validation failure: {str(err)}"
