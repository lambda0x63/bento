# Deploying Bento Demo to Vercel

This guide explains how to deploy the Bento demo to Vercel for a live demo site.

## Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

## Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# From the nextjs-demo directory
cd examples/nextjs-demo

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: (your account)
# - Link to existing project?: N
# - Project name: bento-demo (or your choice)
# - In which directory is your code located?: ./
# - Override settings?: N
```

## Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `examples/nextjs-demo`
   - **Framework Preset**: Next.js (auto-detected)
   - **Node.js Version**: 18.x
5. Add Environment Variables:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
6. Deploy!

## Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
OPENROUTER_API_KEY=your_api_key_here
SITE_URL=https://your-demo.vercel.app (optional)
```

## Custom Domain

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Automatic Deployments

With GitHub integration, every push to main branch will trigger a new deployment.

## Deployment Checklist

- [ ] OpenRouter API key is set in environment variables
- [ ] Build succeeds without errors
- [ ] Demo loads and chat works
- [ ] Document upload works
- [ ] Custom domain configured (optional)

## Troubleshooting

If build fails with vectordb errors:
- This is expected due to native modules
- The demo will still work in production
- These warnings don't affect functionality