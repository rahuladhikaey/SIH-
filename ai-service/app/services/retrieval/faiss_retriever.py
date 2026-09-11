import os
import json
import math
from typing import List, Dict, Any, Optional

try:
    import faiss  # type: ignore
    import numpy as np  # type: ignore
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    faiss = None
    np = None

from app.services.embeddings.provider import EmbeddingProvider, get_embedding_provider

class FAISSRetriever:
    """
    FAISS vector indexer & retriever supporting persistence to disk,
    similarity search, evidence attribution, and pure Python fallback.
    """
    
    def __init__(self, embedding_provider: Optional[EmbeddingProvider] = None):
        self.embedding_provider = embedding_provider or get_embedding_provider()
        self.dimension = self.embedding_provider.dimension
        self.chunks: List[Dict[str, Any]] = []
        self.vectors: List[List[float]] = []
        self._index = None

        if FAISS_AVAILABLE and faiss is not None:
            self._index = faiss.IndexFlatIP(self.dimension)  # Inner product / Cosine similarity for unit vectors

    def build_index(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Builds in-memory FAISS index from list of document chunks.
        """
        if not chunks:
            return 0

        self.chunks = chunks
        texts = [c["text"] for c in chunks]
        self.vectors = self.embedding_provider.embed_batch(texts)

        if FAISS_AVAILABLE and self._index is not None and np is not None:
            np_vectors = np.array(self.vectors, dtype=np.float32)
            faiss.normalize_L2(np_vectors)
            self._index.reset()
            self._index.add(np_vectors)

        return len(self.chunks)

    def save_index(self, directory_path: str) -> bool:
        """
        Persists FAISS index (.bin) and metadata JSON file to disk.
        """
        os.makedirs(directory_path, exist_ok=True)
        meta_file = os.path.join(directory_path, "metadata.json")
        index_file = os.path.join(directory_path, "faiss_index.bin")

        # Save metadata and vectors
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump({
                "dimension": self.dimension,
                "chunks": self.chunks,
                "vectors": self.vectors
            }, f, indent=2)

        # Save FAISS binary index if available
        if FAISS_AVAILABLE and self._index is not None and faiss is not None:
            faiss.write_index(self._index, index_file)

        return True

    def load_index(self, directory_path: str) -> bool:
        """
        Loads FAISS index binary and metadata JSON from disk.
        """
        meta_file = os.path.join(directory_path, "metadata.json")
        index_file = os.path.join(directory_path, "faiss_index.bin")

        if not os.path.exists(meta_file):
            return False

        with open(meta_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.dimension = data.get("dimension", self.dimension)
            self.chunks = data.get("chunks", [])
            self.vectors = data.get("vectors", [])

        if FAISS_AVAILABLE and faiss is not None and os.path.exists(index_file):
            try:
                self._index = faiss.read_index(index_file)
            except Exception:
                self._rebuild_faiss_from_vectors()
        else:
            self._rebuild_faiss_from_vectors()

        return len(self.chunks) > 0

    def _rebuild_faiss_from_vectors(self):
        if FAISS_AVAILABLE and faiss is not None and np is not None and self.vectors:
            self._index = faiss.IndexFlatIP(self.dimension)
            np_vectors = np.array(self.vectors, dtype=np.float32)
            faiss.normalize_L2(np_vectors)
            self._index.add(np_vectors)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Performs similarity search for query string, returning top_k matched chunks with scores.
        """
        if not self.chunks:
            return []

        query_vector = self.embedding_provider.embed_text(query)
        results: List[Dict[str, Any]] = []

        if FAISS_AVAILABLE and self._index is not None and np is not None and self._index.ntotal > 0:
            q_arr = np.array([query_vector], dtype=np.float32)
            faiss.normalize_L2(q_arr)
            scores, indices = self._index.search(q_arr, min(top_k, self._index.ntotal))

            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0 and idx < len(self.chunks):
                    chunk_copy = dict(self.chunks[idx])
                    chunk_copy["relevance_score"] = float(score)
                    results.append(chunk_copy)
        else:
            # Pure Python Cosine Similarity fallback
            scored_chunks = []
            q_norm = math.sqrt(sum(v * v for v in query_vector)) or 1.0
            
            for idx, vec in enumerate(self.vectors):
                dot_prod = sum(q * v for q, v in zip(query_vector, vec))
                v_norm = math.sqrt(sum(v * v for v in vec)) or 1.0
                cosine_sim = dot_prod / (q_norm * v_norm)
                
                chunk_copy = dict(self.chunks[idx])
                chunk_copy["relevance_score"] = float(cosine_sim)
                scored_chunks.append(chunk_copy)

            scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
            results = scored_chunks[:top_k]

        return results
