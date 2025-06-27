# Bento Next.js Demo

This is a Next.js demo application showcasing Bento's AI-powered chat and RAG capabilities.

## Features

- 💬 AI-powered chat with streaming responses
- 📚 Document upload and RAG (Retrieval-Augmented Generation)
- 🎨 Beautiful UI with Tailwind CSS and Radix UI
- 🌓 Dark mode support
- 🔐 Session-based isolation
- 🚀 100+ LLM models via OpenRouter

## Getting Started

### Prerequisites

- Node.js 18+
- OpenRouter API key (get one at https://openrouter.ai)

### Installation

1. Clone the repository and navigate to the demo:
```bash
cd examples/nextjs-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
nextjs-demo/
├── app/
│   ├── api/
│   │   └── bento/
│   │       └── [...path]/
│   │           └── route.ts      # API route handler for bento-core
│   ├── globals.css              # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx               # Main chat interface
├── components/
│   └── ui/                    # Reusable UI components
├── services/
│   ├── chat.ts               # Chat service
│   ├── documents.ts          # Document management service
│   └── session.ts           # Session management
└── lib/
    └── utils.ts             # Utility functions
```

## How It Works

1. **API Routes**: The app uses Next.js API routes to proxy requests to the bento-core server
2. **Session Management**: Each user gets a unique session ID stored in localStorage
3. **Streaming**: Chat responses are streamed in real-time using Server-Sent Events
4. **Document Upload**: Files are processed and stored in a vector database for RAG

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `OPENROUTER_API_KEY` (required): Your OpenRouter API key
- `SITE_URL` (optional): Your site URL for OpenRouter headers

## Learn More

- [Bento Documentation](https://github.com/lambda0x63/bento)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)