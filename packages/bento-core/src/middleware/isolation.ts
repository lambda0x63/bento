import { Context, Next } from 'hono'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'
import { BentoConfig } from '../types'

export interface IsolationData {
  id: string
  createdAt: number
  lastAccessedAt: number
}

// Session expires after 24 hours of inactivity
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000

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
        
        // Track session for cleanup
        await trackSession(isolationKey)
        
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

async function trackSession(sessionId: string) {
  const sessionPath = path.resolve('./data/sessions', sessionId)
  const sessionFile = path.join(sessionPath, 'session.json')
  
  try {
    await fs.mkdir(sessionPath, { recursive: true })
    
    const sessionData: IsolationData = {
      id: sessionId,
      createdAt: Date.now(),
      lastAccessedAt: Date.now()
    }
    
    // Try to read existing session
    try {
      const existing = JSON.parse(await fs.readFile(sessionFile, 'utf-8'))
      sessionData.createdAt = existing.createdAt
    } catch {
      // New session
    }
    
    // Update session file
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2))
  } catch (error) {
    console.error('Session tracking error:', error)
  }
}

// Get isolation path for vector DB or uploads
export function getIsolatedPath(basePath: string, isolationKey?: string): string {
  if (!isolationKey) {
    return path.join(basePath, 'shared')
  }
  return path.join(basePath, 'isolated', isolationKey)
}

// Cleanup old sessions
export async function cleanupSessions(config: BentoConfig) {
  if (config.isolation !== 'session') return
  
  try {
    const sessionsDir = path.resolve('./data/sessions')
    const sessions = await fs.readdir(sessionsDir)
    
    for (const sessionId of sessions) {
      const sessionFile = path.join(sessionsDir, sessionId, 'session.json')
      
      try {
        const data = JSON.parse(await fs.readFile(sessionFile, 'utf-8')) as IsolationData
        
        if (Date.now() - data.lastAccessedAt > SESSION_EXPIRY_MS) {
          // Remove expired session data
          await fs.rm(path.join(sessionsDir, sessionId), { recursive: true, force: true })
          
          // Clean up vector DB data
          if (config.vectorDB?.path) {
            const vectorPath = getIsolatedPath(config.vectorDB.path, sessionId)
            await fs.rm(vectorPath, { recursive: true, force: true }).catch(() => {})
          }
          
          // Clean up uploaded files
          if (config.upload?.dir) {
            const uploadPath = getIsolatedPath(config.upload.dir, sessionId)
            await fs.rm(uploadPath, { recursive: true, force: true }).catch(() => {})
          }
          
          console.log(`Cleaned up expired session: ${sessionId}`)
        }
      } catch {
        // Skip invalid sessions
      }
    }
  } catch (error) {
    // Ignore errors if sessions directory doesn't exist
  }
}