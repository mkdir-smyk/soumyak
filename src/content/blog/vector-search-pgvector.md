---
title: "Building Semantic Search with pgvector and FastAPI"
description: "A look at integrating PostgreSQL's pgvector extension with SentenceTransformers for efficient cold-start retrieval."
pubDate: 2026-07-28
tags:
  - systems
  - databases
  - python
draft: false
---

Traditional keyword search falls short when users query with synonyms or conversational phrases. Storing dense sentence embeddings directly inside PostgreSQL using the `pgvector` extension allows combining relational business data with approximate nearest-neighbor (ANN) vector search in a single database engine.

## Schema Definition

Using PostgreSQL with `pgvector`, we define a table storing 384-dimensional dense vectors (produced by models like `all-MiniLM-L6-v2`):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(384)
);

-- Build an HNSW index for fast approximate cosine distance search
CREATE INDEX ON articles 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

## Querying from FastAPI

In FastAPI, we compute query embeddings in-memory and execute a cosine similarity query directly in SQL using the `<=>` operator (cosine distance):

```python
from fastapi import FastAPI, Depends
from sentence_transformers import SentenceTransformer
import psycopg2

app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.get("/search")
def search_articles(q: str, limit: int = 5):
    query_vec = model.encode(q).tolist()
    
    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT id, title, published_at, 1 - (embedding <=> %s::vector) AS similarity
            FROM articles
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
            """,
            (query_vec, query_vec, limit)
        )
        results = cur.fetchall()
        
    return [{"id": r[0], "title": r[1], "score": float(r[3])} for r in results]
```

## Performance Trade-offs

| Index Type | Build Time | Query Throughput | Recall@10 | Memory Footprint |
| :--- | :--- | :--- | :--- | :--- |
| **Flat (Exact)** | 0s | Low | 100% | Lowest |
| **IVFFlat** | Fast | Medium | ~90-95% | Low |
| **HNSW** | Slower | Very High | ~97-99% | Higher (RAM) |

For collections under 1 million documents, an HNSW index fits comfortably in modest server RAM and responds in sub-10 milliseconds without needing a separate vector database cluster.
