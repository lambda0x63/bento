# Bento

A FastAPI-based local AI chatbot starter kit

## Features

- **Multi-AI Models**: OpenAI GPT-4, Anthropic Claude 3 Sonnet
- **RAG Support**: PDF/DOCX/TXT document-based Q&A
- **Real-time Streaming**: Response streaming, conversation context management
- **Desktop App**: Windows/MacOS support

## Tech Stack

- **Backend**: FastAPI (Python 3.12), ChromaDB, PyPDF, docx2txt
- **Frontend**: Vanilla JavaScript, TailwindCSS  
- **AI/ML**: OpenAI API, Anthropic API
- **Tools**: Poetry, PyInstaller

## Requirements

- Python 3.10+
- Poetry
- OpenAI API key (required)
- Anthropic API key (optional)

## Installation

```bash
git clone https://github.com/root39293/bento.git
cd bento
curl -sSL https://install.python-poetry.org | python3 -  # if Poetry not installed
poetry install
```

## Usage

**Development Server**
```bash
poetry run uvicorn src.main:app --reload
```

**Desktop Build**
```bash
# Windows
poetry run python build_win.py

# MacOS  
poetry run python build_mac.py
```

## How to Use

1. Access browser: `http://localhost:8000`
2. Configure API keys
3. Select model and options
4. Start conversation (upload documents for RAG)

## Structure

```
bento-chat-assistant/
├── src/
│   ├── chat/           # Chat modules
│   ├── core/           # Config/state management
│   ├── rag/            # RAG modules
│   ├── desktop.py      # Desktop entry point
│   └── main.py         # FastAPI entry point
├── static/             # Frontend files
├── config/             # Configuration
├── data/              # Data storage
└── build_*.py         # Build scripts
```
