# Bento

[![npm version](https://img.shields.io/npm/v/create-bento-app?color=cb3837&label=create-bento-app&logo=npm)](https://www.npmjs.com/package/create-bento-app)
[![npm version](https://img.shields.io/npm/v/bento-core?color=38a169&label=bento-core&logo=npm)](https://www.npmjs.com/package/bento-core)
[![npm downloads](https://img.shields.io/npm/dt/create-bento-app?color=blue&label=downloads&logo=npm)](https://www.npmjs.com/package/create-bento-app)

> **"The RAG Framework for Modern Web"**
> 별도 인프라 구축 없이 로컬에서 즉시 실행되는 경량화 AI 채팅 엔진.

- **Embedded RAG Engine** LanceDB 내장으로 별도 벡터 DB 인프라 불필요
- **Full-Stack Isolation** 멀티 테넌트(Multi-tenant) 및 사용자 세션 데이터 완벽 격리
- **Framework Agnostic** React, Next.js, Vue, SvelteKit 등 모든 모던 웹 프레임워크 지원

> **📚 공식 문서 (Documentation)**: [https://docs-coral-rho.vercel.app](https://docs-coral-rho.vercel.app/)

## 핵심 아키텍처 (Architecture)

### 1. Zero-Infrastructure RAG (`bento-core`)
무거운 Vector DB(Pinecone, Weaviate 등)를 대체하는 **고성능 임베디드 벡터 엔진**.
- **Local Embedded**: 파일 시스템 기반 영구 저장소(Persistent Storage) 제공.
- **Smart Parsing**: PDF, DOCX, TXT 파일의 텍스트 추출 및 청킹(Chunking) 자동화.
- **Context injection**: 사용자 질의(Query)와 연관된 문서 조각을 LLM 프롬프트에 자동 주입.

### 2. Enterprise-Grade API Server
**Hono** 및 **Node.js** 기반의 경량화된 고성능 API 게이트웨이.
- **Unified Interface**: OpenAI 호환 채팅 및 임베딩 API 엔드포인트 제공.
- **Streaming First**: SSE(Server-Sent Events) 기반의 실시간 토큰 스트리밍 처리.
- **Middleware System**: CORS, 인증, 데이터 격리 등 엔터프라이즈급 미들웨어 탑재.

### 3. Rapid Scaffolding CLI (`create-bento-app`)
개발 초기 단계의 반복적인 보일러플레이트 코드 제거.
- **Interactive Setup**: 대화형 인터페이스를 통한 프로젝트 구성 (Framework, TS/JS 등).
- **Auto Integration**: 선택한 프레임워크에 최적화된 Bento 연동 코드 및 환경 변수 주입.

## 시작하기 (Getting Started)

### CLI로 프로젝트 생성 (Recommended)
가장 빠르고 표준화된 방법. 단일 명령어로 스캐폴딩 완료.

```bash
npx create-bento-app@latest my-ai-app
```

### 라이브러리 직접 설치 (Manual)
기존 프로젝트에 Bento RAG 엔진만 탑재.

```bash
npm install bento-core
```

## 개발 및 기여 (Development)

이 저장소는 모노레포(Monorepo) 구조로 관리됨.

```bash
# 의존성 설치
npm install

# 전체 패키지 빌드 (Core + CLI)
npm run build
```

## 기술 스택 (Tech Stack)
- **Core Runtime** Node.js 18+ (Edge Compatible)
- **Web Framework** Hono (Web Standards)
- **Vector Engine** LanceDB (Rust-based)
- **LLM SDK** OpenAI Protocol
- **Language** TypeScript 5.0+