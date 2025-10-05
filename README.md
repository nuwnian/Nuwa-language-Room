# Nuwa Language Room

A minimal language learning chat app with AI assistance and grammar correction.

## Quick Start

1. **Start Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

2. **Or use Docker:**
```bash
docker-compose up --build
```

## API Endpoints

- `POST /chat` - Send message, get AI reply
- `POST /correction` - Get grammar correction and translation
- `GET /` - Health check

## Free Upgrades Later

Replace mock responses with:
- **Ollama** (local LLM)
- **Hugging Face Transformers**
- **OpenAI API** (when budget allows)

Backend runs on `http://localhost:8000`