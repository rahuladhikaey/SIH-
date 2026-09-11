import os
import hashlib
import math
from abc import ABC, abstractmethod
from typing import List
import httpx

class EmbeddingProvider(ABC):
    """Abstract interface for embedding generation models."""
    
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Generates embedding vector for a single string."""
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embedding vectors for a batch of strings."""
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Vector dimension."""
        pass


class MockEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic vector generator for testing and offline execution.
    Generates unit-normalized 384-dimensional vectors based on string hash.
    """
    def __init__(self, dim: int = 384):
        self._dim = dim

    @property
    def dimension(self) -> int:
        return self._dim

    def embed_text(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self._dim
            
        vector = []
        words = text.lower().split()
        
        for i in range(self._dim):
            # Seed value combining word features and index
            seed_str = f"{i}_{text}_{words[i % len(words)] if words else ''}"
            hash_val = int(hashlib.md5(seed_str.encode('utf-8')).hexdigest(), 16)
            val = (hash_val % 10000) / 5000.0 - 1.0  # Range -1.0 to 1.0
            vector.append(val)

        # L2 Normalize vector
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]

        return vector

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]


class HuggingFaceEmbeddingProvider(EmbeddingProvider):
    """
    Hugging Face Feature Extraction Embedding Provider.
    Calls Hugging Face Inference API for sentence-transformers models.
    """
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", api_token: str = None):
        self.model_name = model_name
        self.api_token = api_token or os.getenv("HUGGINGFACE_API_TOKEN", "")
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_name}"
        self._dim = 384
        self._fallback = MockEmbeddingProvider(dim=self._dim)

    @property
    def dimension(self) -> int:
        return self._dim

    def embed_text(self, text: str) -> List[float]:
        if not self.api_token:
            return self._fallback.embed_text(text)

        headers = {"Authorization": f"Bearer {self.api_token}"}
        payload = {"inputs": text, "options": {"wait_for_model": True}}

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.post(self.api_url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    # HF returns embedding list or list of lists
                    if isinstance(data, list) and len(data) > 0:
                        if isinstance(data[0], float):
                            return data
                        elif isinstance(data[0], list):
                            # Average token embeddings if 2D list returned
                            avg_vec = [sum(col) / len(col) for col in zip(*data)]
                            return avg_vec
        except Exception:
            pass
            
        return self._fallback.embed_text(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]


def get_embedding_provider() -> EmbeddingProvider:
    """Factory creating embedding provider based on environment variables."""
    provider_type = os.getenv("EMBEDDING_PROVIDER", "mock").lower()
    if provider_type == "huggingface":
        return HuggingFaceEmbeddingProvider()
    return MockEmbeddingProvider()
