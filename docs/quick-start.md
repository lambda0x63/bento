# Quick Start

Get Bento running in under 5 minutes.

## Installation

```bash
npx create-bento-app@latest my-chat-app
```

Follow the prompts to:
1. Choose your framework
2. Set up the project
3. Install dependencies

## Manual Setup

If you prefer manual setup:

```bash
# Create project
mkdir my-bento-app && cd my-bento-app
npm init -y

# Install Bento
npm install bento-core

# Install dev dependencies
npm install -D typescript tsx dotenv
```

Create `server.ts`:

```typescript
import { createBentoServer } from 'bento-core'
import dotenv from 'dotenv'

dotenv.config()

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!
})

server.start()
```

Create `.env`:

```bash
OPENROUTER_API_KEY=your-key-here
```

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch server.ts"
  }
}
```

Run:

```bash
npm run dev
```

## Test Your Setup

Once running, test the API:

```bash
# List models
curl http://localhost:3001/api/chat/models

# Send a message
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

## What's Next?

- [Add a frontend →](/getting-started#basic-setup)
- [Enable RAG →](/rag-system)
- [Deploy to production →](/deployment)

## Common Issues

### Port Already in Use

Change the port:

```typescript
const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  port: 3002 // Different port
})
```

### API Key Not Working

1. Check your [OpenRouter dashboard](https://openrouter.ai/keys)
2. Make sure the key has credits
3. Verify `.env` is in the root directory

### TypeScript Errors

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true
  }
}
```