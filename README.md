# 🏛️ AI Legal Document Assistant

> An AI-powered legal document intelligence platform that lets you upload, analyze, summarize, and chat with your legal documents using Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/React-Frontend-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green) ![Gemini](https://img.shields.io/badge/Gemini-AI-orange) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register, login, and protected routes
- 📄 **Document Upload** — Upload PDF and DOCX legal documents
- 🤖 **AI Summarization** — Get instant AI-generated summaries using Gemini
- 💬 **AI Chat** — Chat with your document, ask questions, get precise answers
- ⚠️ **Risk Detection** — AI identifies risky clauses with High/Medium/Low severity
- 🔍 **Semantic Search** — Search document content by meaning using RAG + ChromaDB
- 📊 **Analytics Dashboard** — Charts showing document activity and types
- 🧠 **RAG Pipeline** — Document chunking, embeddings, and vector search
- 💾 **Persistent Chat History** — Chat sessions saved per document
- 🌙 **Dark/Light Mode** — Toggle per document page

---F

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Router, Recharts |
| Backend | FastAPI, Python, SQLAlchemy, Alembic |
| Database | PostgreSQL |
| AI | Google Gemini 2.5 Flash |
| Vector DB | ChromaDB + sentence-transformers |
| Auth | JWT tokens, bcrypt password hashing |
| File Processing | PyPDF, python-docx |

---

## 📁 Project Structure

ai-legal-assistant/

├── backend/

│   ├── app/

│   │   ├── api/

│   │   │   ├── auth.py        # Auth routes

│   │   │   ├── documents.py   # Document routes

│   │   │   ├── ai.py          # AI routes

│   │   │   └── chat.py        # Chat routes

│   │   ├── models/

│   │   │   ├── user.py        # User model

│   │   │   ├── document.py    # Document model

│   │   │   └── chat.py        # Chat session + message models

│   │   ├── schemas/           # Pydantic schemas

│   │   ├── services/

│   │   │   ├── gemini_service.py     # AI summarization, chat, risks

│   │   │   ├── extraction_service.py # PDF/DOCX text extraction

│   │   │   ├── chunking_service.py   # Document chunking

│   │   │   └── vector_service.py     # ChromaDB operations

│   │   └── core/

│   │       ├── database.py    # DB connection

│   │       ├── security.py    # JWT + password hashing

│   │       └── deps.py        # FastAPI dependencies

│   ├── alembic/               # Database migrations

│   ├── main.py                # FastAPI app entry point

│   └── requirements.txt

└── frontend/

└── src/

├── pages/

│   ├── Dashboard.jsx

│   ├── DocumentDetail.jsx

│   ├── Analytics.jsx

│   ├── Search.jsx

│   ├── SemanticSearch.jsx

│   └── Settings.jsx

├── components/

│   ├── Sidebar.jsx

│   ├── ChatTab.jsx

│   ├── SummaryTab.jsx

│   ├── RiskTab.jsx

│   ├── StatsCard.jsx

│   └── UploadModal.jsx

├── context/

│   └── AuthContext.jsx

└── services/

└── api.js

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create your `.env` file:
```env
DATABASE_URL=postgresql://username@localhost:5432/ai_legal_db
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key-here
```

Run migrations and start server:
```bash
alembic upgrade head
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `ALGORITHM` | JWT algorithm (HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry in minutes |
| `GEMINI_API_KEY` | Google Gemini API key from aistudio.google.com |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/change-password` | Change password |
| POST | `/documents/upload` | Upload PDF/DOCX |
| GET | `/documents/` | List user documents |
| DELETE | `/documents/{id}` | Delete document |
| GET | `/documents/search` | Search documents |
| GET | `/documents/analytics/stats` | Get analytics data |
| POST | `/ai/{id}/summarize` | Generate AI summary |
| POST | `/ai/{id}/risks` | Detect risky clauses |
| POST | `/ai/{id}/chat` | Ask question about document |
| POST | `/ai/semantic-search` | Semantic search across docs |
| POST | `/chat/sessions` | Create chat session |
| GET | `/chat/sessions/{doc_id}` | Get sessions for document |
| GET | `/chat/messages/{session_id}` | Get messages in session |
| POST | `/chat/message` | Send message in session |
| DELETE | `/chat/sessions/{id}` | Delete chat session |

---

## 🧠 How RAG Works

PDF Upload

↓

Text Extraction (PyPDF / python-docx)

↓

Text Chunking (1000 char chunks, 200 overlap)

↓

Embeddings (sentence-transformers all-MiniLM-L6-v2)

↓

Store in ChromaDB

↓

User asks question

↓

Question → Embedding → Vector Search → Top 5 chunks

↓

Relevant chunks + Question → Gemini 2.5 Flash

↓

Accurate answer returned

---

## 📸 Screenshots

### Dashboard
Clean dashboard with document stats, recent uploads, and quick actions.

### AI Chat
Claude-inspired chat interface with persistent history and dark mode.

### Risk Detection
AI-powered clause analysis with High/Medium/Low severity badges.

### Analytics
Line charts and pie charts showing document activity over time.

---

## 👨‍💻 Author

**Aryan Kumar**
- B.Tech Electronics and Communication, VIT
- Full Stack AI Developer

---

## 📄 License

This project is for portfolio and educational purposes.