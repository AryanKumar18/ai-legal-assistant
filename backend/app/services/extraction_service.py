from pypdf import PdfReader
from docx import Document
import os
import tempfile
import requests


def extract_text_from_pdf(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""


def extract_text(file_path: str, file_type: str) -> str:
    """Extract text from file - supports both local paths and Cloudinary URLs"""
    try:
        # If it's a URL, download first
        if file_path.startswith("http"):
            response = requests.get(file_path)
            ext = ".pdf" if file_type == "pdf" else ".docx"
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(response.content)
                tmp_path = tmp.name
            try:
                if file_type == "pdf":
                    return extract_text_from_pdf(tmp_path)
                elif file_type == "docx":
                    return extract_text_from_docx(tmp_path)
            finally:
                os.remove(tmp_path)
        else:
            # Local file
            if file_type == "pdf":
                return extract_text_from_pdf(file_path)
            elif file_type == "docx":
                return extract_text_from_docx(file_path)
    except Exception as e:
        print(f"Text extraction error: {e}")
    return ""