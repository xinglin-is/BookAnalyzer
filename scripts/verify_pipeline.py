from dotenv import load_dotenv

# Load secrets from secrets.env in the root if it exists
# We look for secrets.env two levels up from this script (scripts/ -> root)
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
load_dotenv(os.path.join(root_dir, "secrets.env"))

API_URL = "http://localhost:8000"
API_KEY = "sk-proj-test-key-placeholder" 

# Use the key from the environment variable (secrets.env) if available
REAL_API_KEY = os.getenv("OPENAI_API_KEY", "")

def run_verification():
    if not REAL_API_KEY:
        print("WARNING: OPENAI_API_KEY not found in secrets.env. The analysis step will likely fail.")
        print("Please create a 'secrets.env' file in the project root with OPENAI_API_KEY=sk-...")
    print("Starting verification...")
    
    # 1. Create a dummy test file
    test_file_path = "test_book.txt"
    with open(test_file_path, "w", encoding="utf-8") as f:
        f.write("Harry Potter is a wizard. He is friends with Ron Weasley and Hermione Granger. They go to Hogwarts.")
        
    # 2. Upload
    print("Uploading file...")
    with open(test_file_path, "rb") as f:
        files = {"file": f}
        try:
            res = requests.post(f"{API_URL}/upload", files=files)
            if res.status_code != 200:
                print(f"Upload failed: {res.text}")
                return
            print("Upload success:", res.json())
        except Exception as e:
            print(f"Connection error: {e}")
            return

    # 3. Start Analysis
    print("Starting analysis...")
    analyze_payload = {"filename": "test_book.txt", "api_key": REAL_API_KEY}
    res = requests.post(f"{API_URL}/analyze", json=analyze_payload)
    if res.status_code != 200:
        print(f"Analyze start failed: {res.text}")
        return
    
    task_id = res.json()["task_id"]
    print(f"Analysis started. Task ID: {task_id}")
    
    # 4. Poll Status
    status = "processing"
    while status == "processing":
        time.sleep(2)
        res = requests.get(f"{API_URL}/status/{task_id}")
        data = res.json()
        status = data["status"]
        print(f"Status: {status}, Progress: {data.get('progress')}%")
        
    if status == "failed":
        print(f"Analysis failed: {data.get('error')}")
        # Even if it failed (e.g. OpenAI quota), the flow works.
        return

    print("Analysis completed successfully.")
    book_id = data["result"]["book_id"]
    
    # 5. Check Graph
    print(f"Fetching graph for {book_id}...")
    res = requests.get(f"{API_URL}/book/{book_id}")
    if res.status_code == 200:
        graph = res.json()
        print(f"Graph fetched. Nodes: {len(graph['nodes'])}, Links: {len(graph['links'])}")
    else:
        print("Failed to fetch graph.")
        
    # 6. Query
    print("Querying RAG...")
    query_payload = {"book_id": book_id, "query": "Who is Harry's friend?", "api_key": REAL_API_KEY}
    res = requests.post(f"{API_URL}/query", json=query_payload)
    if res.status_code == 200:
        print("Query Answer:", res.json())
    else:
        print(f"Query failed: {res.text}")

    # Cleanup
    if os.path.exists(test_file_path):
        os.remove(test_file_path)

if __name__ == "__main__":
    run_verification()
