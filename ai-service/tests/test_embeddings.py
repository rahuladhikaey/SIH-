import pytest
import math
from app.services.embeddings.provider import MockEmbeddingProvider, HuggingFaceEmbeddingProvider, get_embedding_provider

def test_mock_embedding_provider_dimension():
    provider = MockEmbeddingProvider(dim=384)
    assert provider.dimension == 384
    
    vec = provider.embed_text("Clinical hypertension guideline")
    assert len(vec) == 384
    
    # Test L2 unit normalization
    norm = math.sqrt(sum(v * v for v in vec))
    assert pytest.approx(norm, 0.001) == 1.0

def test_mock_embedding_provider_deterministic():
    provider = MockEmbeddingProvider(dim=384)
    vec1 = provider.embed_text("Diabetes type 2 insulin protocol")
    vec2 = provider.embed_text("Diabetes type 2 insulin protocol")
    assert vec1 == vec2

def test_embedding_batch():
    provider = MockEmbeddingProvider(dim=384)
    batch_vecs = provider.embed_batch(["Text A", "Text B"])
    assert len(batch_vecs) == 2
    assert len(batch_vecs[0]) == 384
    assert len(batch_vecs[1]) == 384

def test_embedding_provider_factory():
    provider = get_embedding_provider()
    assert provider is not None
    assert provider.dimension > 0
