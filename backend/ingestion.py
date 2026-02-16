import pdfplumber
import os

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
        return ""
    return text

def extract_text_from_txt(file_path: str) -> str:
    """Extracts text from a TXT file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error reading TXT {file_path}: {e}")
        return ""

def process_uploaded_file(file_path: str) -> str:
    """Determines file type and extracts text."""
    if file_path.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".txt"):
        return extract_text_from_txt(file_path)
    else:
        raise ValueError("Unsupported file format. Please upload .pdf or .txt.")
