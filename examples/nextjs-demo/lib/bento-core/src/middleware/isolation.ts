import { Context, Next } from 'hono'
import crypto from 'crypto'
import { BentoConfig } from '../types'

export interface IsolationData {
  id: string
  createdAt: number
  lastAccessedAt: number
}

// In-memory session storage for serverless
const sessions = new Map<string, IsolationData>()

export function createIsolationMiddleware(config: BentoConfig) {
  return async function isolationMiddleware(c: Context, next: Next) {
    let isolationKey: string | undefined
    
    switch (config.isolation) {
      case 'none':
        // No isolation - everyone shares the same DB
        break
        
      case 'session':
        // Automatic session-based isolation
        isolationKey = c.req.header('x-session-id')
        
        // Validate session ID format
        if (isolationKey && !/^[a-f0-9]{32}$/.test(isolationKey)) {
          isolationKey = undefined
        }
        
        // Generate new session ID if not provided or invalid
        if (!isolationKey) {
          isolationKey = crypto.randomBytes(16).toString('hex')
        }
        
        // Track session in memory
        trackSession(isolationKey)
        
        // Add session ID to response header
        c.header('x-session-id', isolationKey)
        break
        
      case 'custom':
        // User provides isolation key (e.g., from auth system)
        // They can set it using c.set('isolationKey', userId) in their middleware
        isolationKey = c.get('isolationKey') || c.req.header('x-isolation-key')
        break
    }
    
    // Store isolation key in context for routes to use
    c.set('isolationKey', isolationKey)
    
    await next()
  }
}

function trackSession(sessionId: string) {
  const now = Date.now()
  const existing = sessions.get(sessionId)
  
  sessions.set(sessionId, {
    id: sessionId,
    createdAt: existing?.createdAt || now,
    lastAccessedAt: now
  })
  
  // Clean up old sessions periodically
  if (Math.random() < 0.01) { // 1% chance to run cleanup
    cleanupSessions()
  }
}

// Get isolation path for vector DB or uploads
export function getIsolatedPath(basePath: string, isolationKey?: string): string {
  if (!isolationKey) {
    return `${basePath}_shared`
  }
  return `${basePath}_isolated_${isolationKey}`
}

// Cleanup old sessions
export function cleanupSessions() {
  const now = Date.now()
  const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours
  
  for (const [sessionId, data] of sessions.entries()) {
    if (now - data.lastAccessedAt > SESSION_EXPIRY_MS) {
      sessions.delete(sessionId)
      console.log(`Cleaned up expired session: ${sessionId}`)
    }
  }
}