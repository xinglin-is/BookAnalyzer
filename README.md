# BookAnalyzer

## Project Structure

- `backend/`: Python FastAPI backend
- `frontend/`: React Vite frontend
- `data/`: Data storage

## How to Run locally

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python main.py
   ```
   The backend will run at [http://localhost:8000](http://localhost:8000)

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will typically run at [http://localhost:5173](http://localhost:5173) (check the terminal output for the exact link).
