from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import torch
import numpy as np

app = FastAPI(title="ElevateCv AI Service")

# Load model globally (use all-MiniLM-L6-v2 for speed as requested)
model = SentenceTransformer('all-MiniLM-L6-v2')

class TextRequest(BaseModel):
    text: str

class TextsRequest(BaseModel):
    texts: list[str]

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

@app.get("/")
def read_root():
    return {"status": "online", "model": "all-MiniLM-L6-v2"}

@app.post("/embed")
async def embed_text(request: TextRequest):
    try:
        embedding = model.encode(request.text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed_batch")
async def embed_texts(request: TextsRequest):
    try:
        embeddings = model.encode(request.texts)
        return {"embeddings": embeddings.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similarity")
async def calculate_similarity(request: SimilarityRequest):
    try:
        embeddings = model.encode([request.text1, request.text2])
        sim = util.cos_sim(embeddings[0], embeddings[1])
        return {"similarity": float(sim[0][0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
