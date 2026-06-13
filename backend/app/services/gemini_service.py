from google import genai
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_document(text: str) -> str:
    prompt = f"""
    You are an expert legal document analyst.
    
    Analyze the following legal document and provide:
    1. A clear 3-4 sentence summary of what this document is about
    2. Key Points (list the 5 most important points)
    3. Parties Involved (who are the parties in this document)
    4. Important Dates or Deadlines (if any)
    
    Format your response clearly with these exact headings:
    **Summary**
    **Key Points**
    **Parties Involved**
    **Important Dates**
    
    Document:
    {text[:8000]}
    """
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text


def explain_clause(clause_text: str) -> str:
    prompt = f"""
    You are an expert legal document analyst.
    Explain the following legal clause in simple, plain English 
    that a non-lawyer can understand.
    Keep it concise and clear.
    
    Clause:
    {clause_text}
    """
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text


def detect_risks(text: str) -> list:
    prompt = f"""
    You are an expert legal risk analyst.
    Analyze this legal document and identify risky clauses.
    
    Return ONLY a JSON array with this exact format, nothing else:
    [
      {{
        "clause": "clause name",
        "description": "why this is risky in one sentence",
        "severity": "High" or "Medium" or "Low"
      }}
    ]
    
    Document:
    {text[:8000]}
    """
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    text_response = response.text.strip()

    if "```json" in text_response:
        text_response = text_response.split("```json")[1].split("```")[0].strip()
    elif "```" in text_response:
        text_response = text_response.split("```")[1].split("```")[0].strip()

    return json.loads(text_response)


def answer_question(question: str, document_text: str) -> str:
    prompt = f"""
    You are an expert legal document analyst and professional assistant.
    Answer the following question based ONLY on the document provided.
    If the answer is not in the document, say "This information is not mentioned in the document."
    
    Formatting rules:
    - Use **bold** for company names, headings, important terms
    - Use bullet points for lists
    - Add a horizontal divider (---) between separate sections or experiences
    - Use proper spacing between sections
    - Keep responses clean and well structured
    - For work experience, format each job as a separate section with --- between them
    
    Document:
    {document_text[:8000]}
    
    Question: {question}
    """
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text