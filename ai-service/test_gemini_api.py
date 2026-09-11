import os
import json
import httpx
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
api_key = ""
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("GEMINI_API_KEY=")[1].strip()
            elif not api_key and line.startswith("OPENAI_API_KEY="):
                api_key = line.split("OPENAI_API_KEY=")[1].strip()

print("Testing Gemini API Key:", api_key[:15] + "..." if api_key else "NONE")

models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]

url_template = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

sample_prompt = """
System Instruction:
You are a clinical AI documentation assistant. Output ONLY valid JSON with keys: patient_overview, current_medications, investigations, risk_flags, missing_information, evidence_references.

User Request:
Patient statement: "hi my name is Pooja I am 20 years old female I am experienceing heavy migraine pain and I don't think that I have any eye power what should I do"
"""

payload = {
    "contents": [
        {
            "parts": [{"text": sample_prompt}]
        }
    ],
    "generationConfig": {
        "response_mime_type": "application/json",
        "temperature": 0.2
    }
}

for model in models_to_test:
    url = url_template.format(model=model, key=api_key)
    print(f"\n--- Testing Model: {model} ---")
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, json=payload)
            print(f"Status Code: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                print("SUCCESS! Gemini Response:")
                print(text[:400])
                break
            else:
                print(f"Error Response: {resp.text}")
    except Exception as e:
        print(f"Exception: {e}")
