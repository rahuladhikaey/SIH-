import hashlib
from typing import List, Dict, Any

class TextChunker:
    """
    Cleans and chunks text documents with configurable overlap and metadata attribution.
    """
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Removes extraneous whitespace and standardizes newlines."""
        if not text:
            return ""
        lines = [line.strip() for line in text.splitlines()]
        cleaned = "\n".join([line for line in lines if line])
        return cleaned

    @classmethod
    def chunk_document(
        cls,
        text: str,
        source_doc: str,
        chunk_size: int = 200,
        overlap: int = 40
    ) -> List[Dict[str, Any]]:
        """
        Splits document text into overlapping chunks tagged with source metadata.
        
        Args:
            text: Raw document text
            source_doc: File name / document identifier
            chunk_size: Target character length per chunk
            overlap: Character overlap between consecutive chunks
            
        Returns:
            List of dicts containing chunk metadata and text snippet.
        """
        cleaned = cls.clean_text(text)
        if not cleaned:
            return []

        chunks: List[Dict[str, Any]] = []
        start = 0
        text_length = len(cleaned)
        chunk_index = 0

        while start < text_length:
            end = min(start + chunk_size, text_length)
            
            # Adjust end to avoid splitting words if possible
            if end < text_length and not cleaned[end].isspace():
                last_space = cleaned.rfind(' ', start, end)
                if last_space > start:
                    end = last_space

            snippet = cleaned[start:end].strip()
            if snippet:
                # Generate deterministic chunk ID based on source and content
                hasher = hashlib.sha256()
                hasher.update(f"{source_doc}_{chunk_index}_{snippet[:30]}".encode('utf-8'))
                chunk_id = f"chk_{hasher.hexdigest()[:12]}"

                chunks.append({
                    "chunk_id": chunk_id,
                    "source_doc": source_doc,
                    "chunk_index": chunk_index,
                    "start_char": start,
                    "end_char": end,
                    "text": snippet
                })
                chunk_index += 1

            if end >= text_length:
                break
                
            start = end - overlap if (end - overlap) > start else end

        return chunks
