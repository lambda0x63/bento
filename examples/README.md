# Bento Examples

## 🚀 Live Demo

Experience Bento in action: **[bento-demo.vercel.app](https://bento-demo.vercel.app)**

## 📁 Available Examples

### Next.js Demo (`/nextjs-demo`)

A full-featured demo showcasing all Bento capabilities:
- AI-powered chat with 100+ models
- Document upload and RAG
- Real-time streaming responses
- Session isolation
- Dark mode

#### Run Locally

```bash
cd examples/nextjs-demo
npm install
cp .env.example .env.local
# Add your OpenRouter API key to .env.local
npm run dev
```

## 🛠️ Creating Your Own App

Use the CLI to scaffold a new project:

```bash
npx create-bento-app@latest my-app
```

Choose from:
- React (Vite)
- Next.js
- SvelteKit
- Vue
- Custom setup

## 📝 Example Features

All examples demonstrate:
- ✅ Chat interface with streaming
- ✅ Multiple LLM model support
- ✅ Document upload for RAG
- ✅ Session management
- ✅ Responsive design
- ✅ TypeScript support

## 🚢 Deploying Examples

See [nextjs-demo/README-DEPLOY.md](./nextjs-demo/README-DEPLOY.md) for deployment instructions.

## 📖 Learn More

- [Bento Documentation](https://bento-docs.vercel.app)
- [API Reference](https://bento-docs.vercel.app/api-reference)
- [GitHub Repository](https://github.com/lambda0x63/bento)