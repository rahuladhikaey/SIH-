import os
import httpx
import json

api_key = os.getenv("GEMINI_API_KEY", "")

sample_prompt = "Hello Gemini, respond with JSON: {\"status\": \"ok\"}"

payload = {
    "contents": [{"parts": [{"text": sample_prompt}]}],
    "generationConfig": {"response_mime_type": "application/json"}
}

# Test 1: Query param
url1 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
print("--- Test 1: Query Param ---")
try:
    resp = httpx.post(url1, json=payload, timeout=10.0)
    print("Status:", resp.status_code)
    print("Body:", resp.text[:200])
except Exception as e:
    print("Error:", e)

# Test 2: Header x-goog-api-key
url2 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
headers2 = {"Content-Type": "application/json", "x-goog-api-key": api_key}
print("\n--- Test 2: Header x-goog-api-key ---")
try:
    resp = httpx.post(url2, headers=headers2, json=payload, timeout=10.0)
    print("Status:", resp.status_code)
    print("Body:", resp.text[:200])
except Exception as e:
    print("Error:", e)

# Test 3: v1 endpoint
url3 = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
print("\n--- Test 3: v1 Endpoint ---")
try:
    resp = httpx.post(url3, json=payload, timeout=10.0)
    print("Status:", resp.status_code)
    print("Body:", resp.text[:200])
except Exception as e:
    print("Error:", e)
