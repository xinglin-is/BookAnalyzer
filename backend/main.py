from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
import uuid
import asyncio
import json
from typing import Dict
from pydantic import BaseModel
from ingestion import process_uploaded_file
from pipeline import analyze_book
from rag import query_book

app = FastAPI()

# In-memory storage for task status (simple solution for local app)
tasks: Dict[str, dict] = {}

class AnalyzeRequest(BaseModel):
    filename: str
    api_key: str

class QueryRequest(BaseModel):
    book_id: str
    query: str
    api_key: str


# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "../data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "BookAnalyzer API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .pdf and .txt are allowed.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Verify integrity by extracting text
        text = process_uploaded_file(file_path)
        if not text.strip():
             os.remove(file_path) # Clean up invalid file
             raise HTTPException(status_code=400, detail="Failed to extract text from file. File might be empty or corrupted.")
             
        return {
            "filename": file.filename, 
            "message": "File uploaded successfully",
            "text_length": len(text),
            "estimated_tokens": len(text) // 4 # Rough estimate
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def start_analysis(request: AnalyzeRequest):
    file_path = os.path.join(UPLOAD_DIR, request.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing", "progress": 0, "message": "Starting..."}
    
    # Run in background
    asyncio.create_task(run_analysis_task(task_id, file_path, request.api_key))
    
    return {"task_id": task_id, "status": "processing"}

async def run_analysis_task(task_id: str, file_path: str, api_key: str):
    async def update_progress(progress: int, message: str):
        tasks[task_id]["progress"] = progress
        tasks[task_id]["message"] = message

    try:
        tasks[task_id]["message"] = "Ingesting and chunking..."
        book_title = os.path.splitext(os.path.basename(file_path))[0] # Simple title extraction
        
        tasks[task_id]["progress"] = 10
        result = await analyze_book(file_path, api_key, book_title, progress_callback=update_progress)
        
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["result"] = result
        tasks[task_id]["message"] = "Analysis complete."
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

@app.get("/status/{task_id}")
def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@app.get("/books")
def list_books():
    meta_path = "../data/metadata.json"
    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            return json.load(f)
    return {}

@app.get("/book/{book_id}")
def get_book_graph(book_id: str):
    graph_path = f"../data/{book_id}/graph.json"
    if not os.path.exists(graph_path):
        raise HTTPException(status_code=404, detail="Graph not found")
        
    with open(graph_path, 'r') as f:
        return json.load(f)

@app.post("/query")
def ask_book(request: QueryRequest):
    try:
        answer = query_book(request.book_id, request.query, request.api_key)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
