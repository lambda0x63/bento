# bento-core

Core library for adding AI-powered chat to any application.

## Installation

```bash
npm install bento-core
```

## Quick Start

```typescript
import { createBentoServer } from 'bento-core'

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!
})

server.start()
```

## Features

- 🚀 Quick Integration - Works with any framework
- 💬 100+ LLM Models - Access via OpenRouter
- 📚 Built-in RAG - Chat with documents
- 🔐 User Isolation - Multi-tenant support
- 🌊 Streaming - Real-time responses
- 📦 Zero Dependencies* - Embedded vector database

## Documentation

For detailed documentation, visit: [Documentation](https://docs-coral-rho.vercel.app)

## License

MIT