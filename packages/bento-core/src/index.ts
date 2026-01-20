import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { BentoConfig, BentoConfigSchema } from './types'
import { vectorDB } from './services/vectordb'
import { createChatRoutes } from './routes/chat'
import { createDocumentRoutes } from './routes/documents'
import { createIsolationMiddleware, cleanupSessions } from './middleware/isolation'

export class BentoServer {
  private app: Hono
  private config: BentoConfig

  constructor(config: Partial<BentoConfig>) {
    this.config = BentoConfigSchema.parse(config)
    this.app = new Hono()
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    // CORS setup
    if (this.config.corsOrigins) {
      this.app.use('*', cors({
        origin: this.config.corsOrigins,
        credentials: true,
      }))
    } else {
      this.app.use('*', cors())
    }
    
    // Isolation middleware
    if (this.config.isolation !== 'none') {
      this.app.use('*', createIsolationMiddleware(this.config))
    }
  }

  private setupRoutes() {
    this.app.route('/api/chat', createChatRoutes(this.config))
    this.app.route('/api/documents', createDocumentRoutes(this.config))
    this.app.get('/api/health', (c) => c.json({ status: 'ok' }))
  }

  async start() {
    try {
      await vectorDB.initialize(this.config)
      
      // Start cleanup interval for session isolation
      if (this.config.isolation === 'session') {
        // Run cleanup every hour
        setInterval(() => {
          cleanupSessions(this.config).catch(console.error)
        }, 60 * 60 * 1000)
        
        // Initial cleanup
        cleanupSessions(this.config).catch(console.error)
      }
      
      serve({
        fetch: this.app.fetch,
        port: this.config.port
      })
      
      console.log(`🚀 Bento server running on http://localhost:${this.config.port}`)
      if (this.config.isolation === 'session') {
        console.log('📝 Session isolation enabled - sessions expire after 24 hours')
      } else if (this.config.isolation === 'custom') {
        console.log('🔐 Custom isolation enabled - provide isolation key via context')
      }
    } catch (error) {
      console.error('Failed to start server:', error)
      throw error
    }
  }

  getApp() {
    return this.app
  }
  
  fetch(request: Request) {
    return this.app.fetch(request)
  }
}

export function createBentoServer(config: Partial<BentoConfig>) {
  return new BentoServer(config)
}

// Re-export types and utilities
export * from './types'
export { vectorDB } from './services/vectordb'
export { embeddingService } from './services/embedding'
export { documentProcessor } from './utils/documentProcessor'