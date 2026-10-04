from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from layout_extractor import extract_pdf_layout
from ner_extractor import extract_entities
from segmenter import segment_layout_blocks

app = FastAPI(title="ElevateCV Python Extraction Service", version="1.1.0")

# Enable CORS for local backend calling if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextPayload(BaseModel):
    text: str

class EmbedPayload(BaseModel):
    texts: List[str]

class BlocksPayload(BaseModel):
    blocks: list

# Lazy-loaded sentence-transformer model (loaded on first /embed call)
_embedding_model = None
_embedding_model_name = "all-MiniLM-L6-v2"

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer(_embedding_model_name)
        print(f"[EMBED] Loaded {_embedding_model_name} sentence-transformer model.")
    return _embedding_model

@app.on_event("startup")
def startup_event():
    # Eagerly load embedding model on server startup
    try:
        get_embedding_model()
    except Exception as e:
        print(f"[EMBED] Warning: Could not pre-load embedding model: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "elevatecv-python-service",
        "embeddingModel": _embedding_model_name,
        "embeddingLoaded": _embedding_model is not None
    }

@app.post("/embed")
def embed_texts(payload: EmbedPayload):
    """
    Generate semantic embeddings using all-MiniLM-L6-v2 (384-dim).
    Accepts a list of texts, returns a list of embedding vectors.
    No external API dependency — runs entirely on local CPU.
    """
    if not payload.texts or len(payload.texts) == 0:
        raise HTTPException(status_code=400, detail="At least one text string is required.")
    if len(payload.texts) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 texts per request.")

    try:
        model = get_embedding_model()
        embeddings = model.encode(payload.texts, normalize_embeddings=True)
        return {
            "success": True,
            "model": _embedding_model_name,
            "dimensions": embeddings.shape[1],
            "embeddings": [vec.tolist() for vec in embeddings]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@app.post("/extract-layout")
async def extract_layout_endpoint(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for layout extraction.")
    
    try:
        pdf_bytes = await file.read()
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="Empty PDF file uploaded.")
        
        result = extract_pdf_layout(pdf_bytes)
        segmented = segment_layout_blocks(result["blocks"])
        
        return {
            "success": True,
            "filename": file.filename,
            "summary": result["summary"],
            "blocks": result["blocks"],
            "sections": segmented["sections"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF layout: {str(e)}")

@app.post("/segment-layout")
def segment_layout_endpoint(payload: BlocksPayload):
    try:
        segmented = segment_layout_blocks(payload.blocks)
        return {
            "success": True,
            "sections": segmented["sections"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to segment layout: {str(e)}")

@app.post("/extract-entities")
def extract_entities_endpoint(payload: TextPayload):
    try:
        entities = extract_entities(payload.text)
        return {
            "success": True,
            "entities": entities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract entities: {str(e)}")
