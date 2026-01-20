# 시작하기 (Getting Started)

Bento 프레임워크 초기 설정 및 애플리케이션 통합 가이드.

## 사전 요구 사항 (Prerequisites)

- **Runtime** Node.js 18+
- **Package Manager** npm, yarn, pnpm
- **API Key** [OpenRouter API key](https://openrouter.ai/keys) 발급 필요

## 설치 (Installation)

두 가지 방식을 제공하며, **CLI 도구 사용**을 권장함.

### 옵션 1: CLI 도구 사용 (Recommended)

`create-bento-app`을 통한 즉시 프로젝트 생성:

```bash
npx create-bento-app@latest
```

**자동화 수행 작업**:
1. 프레임워크 선택 및 스캐폴딩 (React, Next.js, SvelteKit, Vue)
2. Bento 통합 코드 및 환경 설정 자동 주입
3. 의존성 패키지 설치

### 옵션 2: 기존 프로젝트 통합 (Manual)

기존 프로젝트에 코어 패키지 추가:

```bash
npm install bento-core
```

## 기본 설정 (Basic Setup)

### 1. 환경 변수 설정 (Environment Variables)

프로젝트 루트에 `.env` 파일 생성 및 키 값 설정:

```bash
# 필수 (Required)
OPENROUTER_API_KEY=your-api-key-here

# 선택 (Optional)
PORT=3001
VECTOR_DB_PATH=./data/vectors
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=10485760
SITE_URL=http://localhost:3001
```

### 2. 서버 인스턴스 생성 (Create Server)

#### Next.js (App Router)

`app/api/bento/[...path]/route.ts` 파일 생성:

```typescript
import { createBentoServer } from 'bento-core';

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
});

async function handler(request: Request) {
  // 요청 URL 재작성 (Next.js 경로 -> Hono 경로)
  // 예: /api/bento/chat -> /api/chat
  const url = new URL(request.url);
  const newPath = url.pathname.replace(/^\/api\/bento/, '/api');
  
  const newRequest = new Request(new URL(newPath, url.origin), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    // @ts-ignore: Next.js Request 호환성
    duplex: 'half'
  });

  return server.fetch(newRequest);
}

export { handler as GET, handler as POST };
```

#### Node.js / Express

`server.js` 파일 생성:

```javascript
import { createBentoServer } from 'bento-core';
import dotenv from 'dotenv';

dotenv.config();

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY,
  port: 3001,
  corsOrigins: ['http://localhost:3000']
});

server.start();
```

### 3. API 요청 (Make Request)

서버 구동 후 채팅 API `POST /api/chat` 호출:

```typescript
// 채팅 메시지 전송
const response = await fetch('/api/bento/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, Bento!' }
    ],
    model: 'openai/gpt-3.5-turbo', // OpenRouter 모델 ID
    stream: true
  })
});

// 스트리밍 응답 처리
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  console.log(decoder.decode(value));
}
```

## 다음 단계 (Next Steps)

- [사용자 격리 (User Isolation)](/user-isolation) 멀티유저 세션 관리
- [RAG 시스템 (RAG System)](/rag-system) 문서 기반 채팅 구현
- [API 레퍼런스 (API Reference)](/api-reference) 전체 엔드포인트 명세