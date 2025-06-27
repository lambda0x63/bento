# Configuration

Complete reference for all Bento configuration options.

## Basic Configuration

```typescript
import { createBentoServer } from 'bento-core'

const server = createBentoServer({
  // Required
  openRouterKey: 'your-api-key',
  
  // Optional
  port: 3001,
  isolation: 'none',
  corsOrigins: ['http://localhost:3000'],
  siteUrl: 'https://myapp.com'
})
```

## Configuration Options

### Core Settings

#### `openRouterKey` (required)
- Type: `string`
- Your OpenRouter API key
- Get one at [openrouter.ai/keys](https://openrouter.ai/keys)

#### `port`
- Type: `number`
- Default: `3001`
- Port for the Bento server

#### `isolation`
- Type: `'none' | 'session' | 'custom'`
- Default: `'none'`
- User isolation strategy
- See [User Isolation](/user-isolation) for details

#### `corsOrigins`
- Type: `string[]`
- Default: `undefined` (allows all origins)
- Allowed CORS origins
- Example: `['http://localhost:3000', 'https://myapp.com']`

#### `siteUrl`
- Type: `string`
- Default: `undefined`
- Your application URL (used for OpenRouter analytics)

### Vector Database

#### `vectorDB`
- Type: `object`
- Vector database configuration

```typescript
vectorDB: {
  path: './data/vectors',    // Storage location
  dimension: 1536           // Embedding dimension
}
```

### File Upload

#### `upload`
- Type: `object`
- File upload configuration

```typescript
upload: {
  dir: './data/uploads',         // Upload directory
  maxFileSize: 10 * 1024 * 1024  // 10MB default
}
```

## Environment Variables

Create a `.env` file:

```bash
# Required
OPENROUTER_API_KEY=your-key-here

# Optional
PORT=3001
VECTOR_DB_PATH=./data/vectors
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=10485760
SITE_URL=https://myapp.com
```

Load with dotenv:

```typescript
import dotenv from 'dotenv'
dotenv.config()

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  port: Number(process.env.PORT) || 3001,
  // ... other options from env
})
```

## Framework-Specific Config

### Next.js

```typescript
// next.config.js
module.exports = {
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  },
  // Increase body size limit for file uploads
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
```

### Vite

```typescript
// vite.config.ts
export default {
  define: {
    'process.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

## Production Configuration

### Security

```typescript
const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  isolation: 'custom', // Use your auth system
  corsOrigins: ['https://myapp.com'], // Restrict origins
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 100 // requests per window
  }
})
```

### Performance

```typescript
const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  vectorDB: {
    path: '/mnt/ssd/vectors', // Use SSD for better performance
    cacheSize: 100 // Cache recent queries
  },
  streaming: {
    highWaterMark: 16 * 1024 // 16KB chunks
  }
})
```

### Monitoring

```typescript
const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  logging: {
    level: 'info',
    format: 'json'
  },
  metrics: {
    enabled: true,
    endpoint: '/metrics'
  }
})
```

## Docker Configuration

### Dockerfile

```docker
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create data directories
RUN mkdir -p data/vectors data/uploads

# Environment
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  bento:
    build: .
    ports:
      - "3001:3001"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## Configuration Validation

Bento uses Zod for runtime validation:

```typescript
import { BentoConfigSchema } from 'bento-core'

// Validate config
try {
  const config = BentoConfigSchema.parse({
    openRouterKey: process.env.OPENROUTER_API_KEY
  })
} catch (error) {
  console.error('Invalid configuration:', error)
}
```

## Custom Extensions

### Add Custom Routes

```typescript
const server = createBentoServer(config)

// Get the Hono app instance
const app = server.getApp()

// Add custom routes
app.get('/health', (c) => c.json({ status: 'ok' }))
app.post('/custom/endpoint', async (c) => {
  // Your custom logic
})

server.start()
```

### Middleware

```typescript
const server = createBentoServer(config)
const app = server.getApp()

// Add custom middleware
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`)
  await next()
})
```

## Troubleshooting

### Debug Mode

```typescript
const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  debug: true // Enable debug logging
})
```

### Common Issues

1. **Missing API Key**
   ```
   Error: OpenRouter API key is required
   ```
   Solution: Set `OPENROUTER_API_KEY` in `.env`

2. **CORS Errors**
   ```
   Access-Control-Allow-Origin error
   ```
   Solution: Add your frontend URL to `corsOrigins`

3. **File Upload Fails**
   ```
   Error: File too large
   ```
   Solution: Increase `upload.maxFileSize`

## Best Practices

1. **Use environment variables** for sensitive data
2. **Set specific CORS origins** in production
3. **Enable isolation** for multi-user apps
4. **Monitor disk usage** for vector DB
5. **Regular backups** of data directory