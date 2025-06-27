# Getting Started

This guide will help you get Bento up and running in your application.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- An [OpenRouter API key](https://openrouter.ai/keys)

## Installation

There are two ways to get started with Bento:

### Option 1: Use the CLI (Recommended)

The fastest way to get started is using our CLI tool:

```bash
npx create-bento-app@latest
```

This will:
1. Let you choose your framework (React, Next.js, SvelteKit, Vue)
2. Create a new project using that framework's official CLI
3. Add Bento integration with setup instructions

### Option 2: Add to Existing Project

If you have an existing project, install the core package:

```bash
npm install bento-core
```

## Basic Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```bash
# Required
OPENROUTER_API_KEY=your-api-key-here

# Optional
PORT=3001
VECTOR_DB_PATH=./data/vectors
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=10485760
SITE_URL=http://localhost:3001
```

### 2. Create the Server

#### For Next.js

Create `app/api/bento/[...path]/route.ts`:

```typescript
import { createBentoServer } from 'bento-core';

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
});

export async function GET(request: Request) {
  return server.fetch(request);
}

export async function POST(request: Request) {
  return server.fetch(request);
}
```

#### For Express/Node.js

Create `server.js`:

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

#### For React/Vue (Standalone)

Run Bento as a separate server:

```typescript
// server.ts
import { createBentoServer } from 'bento-core';

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  port: 3001,
  corsOrigins: ['http://localhost:5173'],
});

server.start();
```

### 3. Make Your First Request

Once your server is running, you can make requests to the Bento API:

```typescript
// Send a chat message
const response = await fetch('/api/bento/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, Bento!' }
    ],
    model: 'default-llm-model',
    stream: true
  })
});

// Handle streaming response
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // Process each chunk
}
```

## Next Steps

- [Configure user isolation](/user-isolation) for multi-user apps
- [Enable RAG](/rag-system) for document-based chat
- [Explore the API](/api-reference) for all available endpoints
- [View examples](/examples/react) for complete implementations

## Troubleshooting

### API Key Issues

If you're getting authentication errors:
1. Make sure your `.env` file is in the project root
2. Verify your API key at [OpenRouter](https://openrouter.ai/keys)
3. Check that environment variables are loaded (use `dotenv` package)

### CORS Errors

If you're getting CORS errors:
1. Add your frontend URL to `corsOrigins` in the server config
2. Make sure to include credentials in your fetch requests

### TypeScript Errors

If you're getting type errors:
1. Make sure you have `@types/node` installed
2. Set `"moduleResolution": "node"` in your `tsconfig.json`

Need help? [Open an issue](https://github.com/lambda0x63/bento/issues) on GitHub.