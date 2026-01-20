# Next.js Demo

A full-featured example of Bento integrated with Next.js App Router.

🚀 **[Live Demo](https://nextjs-demo-fawn-three.vercel.app)**

## Overview

The Next.js demo showcases all Bento features:
- 💬 Real-time streaming chat
- 📚 Document upload and RAG
- 🎨 Beautiful UI with Tailwind CSS
- 🔐 Session-based isolation
- 🎯 Model selection
- 🌓 Dark mode support

## Running the Demo

### 1. Clone the repository

```bash
git clone https://github.com/lambda0x63/bento
cd bento/examples/nextjs-demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp .env.example .env.local
# Add your OpenRouter API key to .env.local
```

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000

## Features

### Chat Interface
- Streaming responses with real-time updates
- Markdown rendering
- Message history
- Loading states

### Document Management
- Drag-and-drop file upload
- Support for PDF, DOCX, TXT
- Document list with delete functionality
- RAG toggle for context-aware responses

### Session Management
- Automatic session ID generation
- Isolated data per browser session
- Persistent sessions via localStorage

## Project Structure

```
nextjs-demo/
├── app/
│   ├── api/bento/[...path]/
│   │   └── route.ts         # API proxy to bento-core
│   ├── page.tsx             # Main chat interface
│   └── layout.tsx           # Root layout
├── services/            
│   ├── chat.ts              # Chat API client
│   ├── documents.ts         # Document API client
│   └── session.ts           # Session management
└── components/ui/           # Shadcn UI components
```

## Key Code Examples

### API Route Handler

```typescript
// app/api/bento/[...path]/route.ts
const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  isolation: 'session',
  vectorDB: { path: './data/vectors' }
})

export async function POST(request, { params }) {
  const path = '/' + params.path.join('/')
  return server.fetch(modifiedRequest)
}
```

### Streaming Chat

```typescript
await chatService.streamChat(
  { messages, model, ragEnabled },
  (chunk) => {
    setMessages(prev => 
      prev.map(m => 
        m.id === assistantMessage.id 
          ? { ...m, content: m.content + chunk }
          : m
      )
    )
  }
)
```

### Client Component

```typescript
'use client'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  // ... chat logic
}
```

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lambda0x63/bento&env=OPENROUTER_API_KEY&root-directory=examples/nextjs-demo)

Or see [README-DEPLOY.md](https://github.com/lambda0x63/bento/tree/main/examples/nextjs-demo/README-DEPLOY.md) for manual deployment.

## Customization

The demo uses:
- **Next.js 14+** with App Router
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **Radix Icons** for icons
- **React Markdown** for message rendering

## Source Code

View the complete source code:
[GitHub - examples/nextjs-demo](https://github.com/lambda0x63/bento/tree/main/examples/nextjs-demo)