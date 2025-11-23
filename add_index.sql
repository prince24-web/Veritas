
-- Add an HNSW index to the embedding column to speed up similarity search
-- This prevents statement timeouts when querying large datasets
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops);
