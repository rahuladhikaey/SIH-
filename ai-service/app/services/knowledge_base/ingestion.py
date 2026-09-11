import os
from typing import Dict, Any, List
from app.services.knowledge_base.chunker import TextChunker
from app.services.retrieval.faiss_retriever import FAISSRetriever
from app.services.embeddings.provider import get_embedding_provider

class KnowledgeBaseIngestionService:
    """
    Ingestion pipeline scanning knowledge-base files, cleaning, chunking,
    generating embeddings, and persisting the FAISS vector index.
    """
    
    def __init__(self, kb_directory: str = None, index_directory: str = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        self.kb_directory = kb_directory or os.path.join(base_dir, "knowledge-base")
        self.index_directory = index_directory or os.path.join(self.kb_directory, "index")
        self.retriever = FAISSRetriever(embedding_provider=get_embedding_provider())

    def run_ingestion(self) -> Dict[str, Any]:
        """
        Executes full ingestion pipeline and returns statistics.
        """
        if not os.path.exists(self.kb_directory):
            return {"status": "error", "message": f"Directory not found: {self.kb_directory}", "indexed_chunks": 0}

        all_chunks: List[Dict[str, Any]] = []
        files_processed = 0

        for file_name in os.listdir(self.kb_directory):
            file_path = os.path.join(self.kb_directory, file_name)
            if os.path.isfile(file_path) and file_name.endswith(".txt"):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                    chunks = TextChunker.chunk_document(text, source_doc=file_name)
                    all_chunks.extend(chunks)
                    files_processed += 1
                except Exception as e:
                    print(f"Error processing file {file_name}: {e}")

        if not all_chunks:
            return {"status": "warning", "message": "No text files found to index", "indexed_chunks": 0}

        count = self.retriever.build_index(all_chunks)
        self.retriever.save_index(self.index_directory)

        return {
            "status": "success",
            "files_processed": files_processed,
            "indexed_chunks": count,
            "index_directory": self.index_directory
        }

    def get_or_load_retriever(self) -> FAISSRetriever:
        """
        Loads persisted index from disk, running ingestion automatically if index file is missing.
        """
        if os.path.exists(os.path.join(self.index_directory, "metadata.json")):
            success = self.retriever.load_index(self.index_directory)
            if success:
                return self.retriever

        # Run ingestion if no valid index loaded
        self.run_ingestion()
        return self.retriever
