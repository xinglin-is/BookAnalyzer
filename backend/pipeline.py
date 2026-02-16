import os
import asyncio
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from ingestion import process_uploaded_file
from extraction import extract_from_chunk, ExtractionResult
from graph_builder import build_graph, export_graph_to_json, save_metadata
from rag import ingest_book_for_rag
import networkx as nx

async def analyze_book(file_path: str, api_key: str, book_title: str, progress_callback=None):
    """
    Main pipeline function:
    1. Ingest text from file.
    2. Chunk text.
    3. Extract entities/relationships from chunks.
    4. Build graph.
    5. Save graph to JSON.
    """
    print(f"Starting analysis for {book_title}...")
    
    # 1. Ingest
    text = process_uploaded_file(file_path)
    if not text:
        raise ValueError("Failed to extract text from file.")
        
    # 2. Chunk
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = splitter.split_text(text)
    print(f"Text split into {len(chunks)} chunks.")
    
    # 2.5 Ingest for RAG
    # We use the raw text or chunks for RAG. rag.py does its own splitting, but passing raw text is fine.
    # To save time, let's pass the raw text and let rag.py handle splitting or modifying rag.py to accept chunks.
    # Current rag.py accepts text.
    try:
        book_id = os.path.splitext(os.path.basename(file_path))[0]
        ingest_book_for_rag(book_id, text, api_key)
    except Exception as e:
        print(f"RAG Ingestion failed: {e}")
    
    # 3. Extract (Process chunks in batches to respect rate limits)
    results: List[ExtractionResult] = []
    batch_size = 5 # Adjust based on rate limits
    total_batches = (len(chunks) + batch_size - 1) // batch_size
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        tasks = [extract_from_chunk(chunk, api_key) for chunk in batch]
        
        # Run batch concurrently
        batch_results = await asyncio.gather(*tasks)
        results.extend(batch_results)
        
        current_batch = i // batch_size + 1
        print(f"Processed batch {current_batch}/{total_batches}")
        
        if progress_callback:
            # Map 10% to 90% range for extraction
            progress = 10 + int((current_batch / total_batches) * 80)
            await progress_callback(progress, f"Analyzing chunk batch {current_batch}/{total_batches}")
        
    # 4. Build Graph
    G = build_graph(results)
    print(f"Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")
    
    # 5. Save
    book_id = os.path.splitext(os.path.basename(file_path))[0]
    output_dir = f"../data/{book_id}"
    os.makedirs(output_dir, exist_ok=True)
    
    graph_path = os.path.join(output_dir, "graph.json")
    export_graph_to_json(G, graph_path)
    
    save_metadata(book_id, book_title, graph_path)
    
    return {
        "book_id": book_id,
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "graph_path": graph_path
    }
