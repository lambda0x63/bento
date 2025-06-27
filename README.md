# 🍱 Bento

> Add AI-powered chat to any app in minutes

[![npm version](https://img.shields.io/npm/v/bento-core.svg)](https://www.npmjs.com/package/bento-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 **[Live Demo](https://bento-demo.vercel.app)** | 📖 **[Documentation](https://bento-docs.vercel.app)**

## Quick Start

```bash
npx create-bento-app@latest
```

Or add to existing project:

```bash
npm install bento-core
```

```typescript
import { createBentoServer } from 'bento-core'

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!
})

server.start()
```

## Features

- 🚀 **Quick Integration** - Works with any framework
- 💬 **100+ LLM Models** - Access various LLMs through unified API
- 📚 **Built-in RAG** - Chat with your documents
- 🔐 **User Isolation** - Multi-tenant support
- 🌊 **Streaming** - Real-time responses
- 📦 **Zero Dependencies*** - Embedded vector database

## Documentation

Visit our documentation site for detailed guides and API references:

**[📖 Documentation](https://bento-docs.vercel.app)**

- [Getting Started](https://bento-docs.vercel.app/getting-started)
- [API Reference](https://bento-docs.vercel.app/api-reference)
- [Examples](https://bento-docs.vercel.app/examples/react)
- [User Isolation](https://bento-docs.vercel.app/user-isolation)

## Demo

### 🌐 Live Demo
Try Bento instantly without any setup: **[bento-demo.vercel.app](https://bento-demo.vercel.app)**

### 💻 Run Demo Locally

```bash
# Clone and run the demo
git clone https://github.com/lambda0x63/bento.git
cd bento/examples/nextjs-demo
npm install

# Set up your OpenRouter API key
cp .env.example .env.local
# Edit .env.local and add your key

npm run dev
# Open http://localhost:3000
```

## Development

To work on Bento packages:

```bash
# Clone the repository
git clone https://github.com/lambda0x63/bento.git
cd bento

# Install dependencies
npm install

# Build packages
npm run build:core
npm run build:cli
```

## License

MIT © [lambda0x63](https://github.com/lambda0x63)

---

<sub>* Except for the AI model API (OpenRouter)</sub>