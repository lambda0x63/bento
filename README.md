# Bento

[![npm version](https://img.shields.io/npm/v/create-bento-app?color=cb3837&label=create-bento-app&logo=npm)](https://www.npmjs.com/package/create-bento-app)
[![npm version](https://img.shields.io/npm/v/bento-core?color=38a169&label=bento-core&logo=npm)](https://www.npmjs.com/package/bento-core)
[![npm downloads](https://img.shields.io/npm/dt/create-bento-app?color=blue&label=downloads&logo=npm)](https://www.npmjs.com/package/create-bento-app)

RAG(Retrieval-Augmented Generation) 기반 AI 백엔드 프레임워크 및 스캐폴딩 도구.

> **상세 문서 (Documentation)**: [Bento Docs (Website)](https://docs-coral-rho.vercel.app/)

## 시스템 개요 (System Overview)

### 핵심 아키텍처 (Core Architecture)
**내장형 RAG 엔진 (Embedded RAG Engine)**
- **LanceDB** 기반의 임베디드 벡터 데이터베이스 사용
- 별도의 외부 인프라(Pinecone, Weaviate 등) 구축 없이 로컬 파일 시스템만으로 동작
- PDF, DOCX, TXT 파일의 텍스트 추출 및 벡터 임베딩 자동화

**API 서버 (API Server)**
- **Hono** 및 **Node.js** 환경의 경량화된 API 게이트웨이
- OpenAI 호환 채팅 인터페이스 및 SSE(Server-Sent Events) 스트리밍 지원
- 멀티 테넌트 환경을 위한 **세션 격리(Session Isolation)** 미들웨어 탑재

**스캐폴딩 CLI (Scaffolding CLI)**
- `create-bento-app` 명령어를 통한 대화형 프로젝트 생성
- React, Next.js, Vue, SvelteKit 등 모던 웹 프레임워크 연동 코드 자동 주입

## 기술 스택 (Tech Stack)

- **Runtime** Node.js 18+
- **Framework** Hono (Web Standards)
- **Vector DB** LanceDB (Rust-based)
- **LLM Integration** OpenAI SDK
- **Language** TypeScript 5.0+

## 설치 및 실행 (Installation)

### CLI 도구 사용 (Recommended)
`create-bento-app`을 사용하여 신규 프로젝트 생성

```bash
npx create-bento-app@latest my-ai-app
```

### 라이브러리 설치 (Manual)
기존 프로젝트에 코어 패키지 의존성 추가

```bash
npm install bento-core
```

## 개발 환경 설정 (Development)

모노레포(Monorepo) 구조로 관리되는 패키지 빌드 방법

```bash
# 의존성 설치
npm install

# 전체 패키지 빌드 (Core + CLI)
npm run build
```