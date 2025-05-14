# Bento

FastAPI 기반 로컬 AI 챗봇 스타터킷

## 기능

- **다중 AI 모델**: OpenAI, Anthropic
- **RAG 지원**: PDF/DOCX/TXT 문서 기반 질의응답
- **실시간 스트리밍**: 응답 스트리밍, 대화 컨텍스트 관리
- **데스크톱 앱**: Windows/MacOS 지원

## 기술 스택

- **Backend**: FastAPI (Python 3.12), ChromaDB, PyPDF, docx2txt
- **Frontend**: Vanilla JavaScript, TailwindCSS  
- **AI/ML**: OpenAI API, Anthropic API
- **도구**: Poetry, PyInstaller

## 요구사항

- Python 3.10+
- Poetry
- OpenAI API 키 (필수)
- Anthropic API 키 (선택)

## 설치

```bash
git clone https://github.com/root39293/bento.git
cd bento
curl -sSL https://install.python-poetry.org | python3 -  # Poetry 미설치시
poetry install
```

## 실행

**개발 서버**
```bash
poetry run uvicorn src.main:app --reload
```

**데스크톱 빌드**
```bash
# Windows
poetry run python build_win.py

# MacOS  
poetry run python build_mac.py
```

## 사용법

1. 브라우저 접속: `http://localhost:8000`
2. API 키 설정
3. 모델 선택 및 옵션 설정
4. 대화 시작 (RAG 사용시 문서 업로드)

## 구조

```
bento-chat-assistant/
├── src/
│   ├── chat/           # 채팅 모듈
│   ├── core/           # 설정/상태 관리
│   ├── rag/            # RAG 모듈
│   ├── desktop.py      # 데스크톱 진입점
│   └── main.py         # FastAPI 진입점
├── static/             # 프론트엔드
├── config/             # 설정 파일
├── data/              # 데이터
└── build_*.py         # 빌드 스크립트
```
