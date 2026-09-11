import os
import shutil
import pytest
from app.services.retrieval.faiss_retriever import FAISSRetriever
from app.services.embeddings.provider import MockEmbeddingProvider

@pytest.fixture
def temp_index_dir(tmp_path):
    d = tmp_path / "faiss_test_index"
    d.mkdir()
    yield str(d)
    shutil.rmtree(str(d), ignore_errors=True)

def test_faiss_build_search_persistence(temp_index_dir):
    provider = MockEmbeddingProvider(dim=384)
    retriever = FAISSRetriever(embedding_provider=provider)

    sample_chunks = [
        {
            "chunk_id": "chk_001",
            "source_doc": "hypertension_guidelines.txt",
            "chunk_index": 0,
            "start_char": 0,
            "end_char": 100,
            "text": "Hypertension is defined as resting blood pressure >= 140/90 mmHg."
        },
        {
            "chunk_id": "chk_002",
            "source_doc": "diabetes_management.txt",
            "chunk_index": 0,
            "start_char": 0,
            "end_char": 100,
            "text": "Diabetes management requires monitoring HbA1c levels every 3 to 6 months."
        }
    ]

    count = retriever.build_index(sample_chunks)
    assert count == 2

    # Test persistence to disk
    save_ok = retriever.save_index(temp_index_dir)
    assert save_ok is True
    assert os.path.exists(os.path.join(temp_index_dir, "metadata.json"))

    # Test loading from disk
    new_retriever = FAISSRetriever(embedding_provider=provider)
    load_ok = new_retriever.load_index(temp_index_dir)
    assert load_ok is True
    assert len(new_retriever.chunks) == 2

    # Test search query
    results = new_retriever.search(query="blood pressure hypertension", top_k=2)
    assert len(results) > 0
    assert "relevance_score" in results[0]
    assert "chunk_id" in results[0]
