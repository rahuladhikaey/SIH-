import pytest
from app.services.knowledge_base.chunker import TextChunker

def test_clean_text():
    raw_text = "  Line 1   \n\n  Line 2  \n \n Line 3 "
    cleaned = TextChunker.clean_text(raw_text)
    assert cleaned == "Line 1\nLine 2\nLine 3"

def test_chunk_document_basic():
    sample_text = (
        "Hypertension is defined as resting systolic blood pressure >= 140 mmHg. "
        "First-line treatment includes ACE inhibitors and ARBs. "
        "Patients with diabetes should maintain target blood pressure below 130/80 mmHg."
    )
    chunks = TextChunker.chunk_document(
        text=sample_text,
        source_doc="hypertension_guidelines.txt",
        chunk_size=100,
        overlap=20
    )

    assert len(chunks) > 0
    first_chunk = chunks[0]
    assert "chunk_id" in first_chunk
    assert first_chunk["chunk_id"].startswith("chk_")
    assert first_chunk["source_doc"] == "hypertension_guidelines.txt"
    assert first_chunk["chunk_index"] == 0
    assert len(first_chunk["text"]) > 0

def test_chunk_document_empty():
    chunks = TextChunker.chunk_document(text="", source_doc="empty.txt")
    assert chunks == []
