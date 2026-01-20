import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import { streamChat, getAvailableModels, MODELS } from '../services/openrouter'
import { vectorDB } from '../services/vectordb'
import { embeddingService } from '../services/embedding'
import { BentoConfig } from '../types'

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  model: z.string().default(MODELS['gpt-3.5']),
  ragEnabled: z.boolean().default(false),
  conversationId: z.string().optional(),
})

export function createChatRoutes(config: BentoConfig) {
  const app = new Hono()

  // Get isolation key from context
  function getIsolationKey(c: any): string | undefined {
    return c.get('isolationKey');
  }

  app.post('/stream', async (c) => {
    try {
      const body = await c.req.json()
      const { messages, model, ragEnabled } = chatRequestSchema.parse(body)
      
      let contextualMessages = messages
      if (ragEnabled) {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()
        if (lastUserMessage) {
          try {
            const isolationKey = getIsolationKey(c)
            const db = await vectorDB.getDB(isolationKey)
            
            const queryEmbedding = await embeddingService.createEmbedding(lastUserMessage.content, config)
            const searchResults = await db.searchDocuments(queryEmbedding, 3)
            
            if (searchResults.length > 0) {
              const context = searchResults
                .map((doc: any) => `[Source: ${doc.metadata.source}]\n${doc.content}`)
                .join('\n\n---\n\n')
              
              const systemMessage = {
                role: 'system' as const,
                content: `You are a helpful assistant. Use the following context to answer the user's question. If the answer cannot be found in the context, say so honestly.\n\nContext:\n${context}\n\nAnswer the user's question based on the above context.`
              }
              
              contextualMessages = [
                systemMessage,
                ...messages.filter(m => m.role !== 'system')
              ]
            }
          } catch (error) {
            console.error('RAG search error:', error)
          }
        }
      }
      
      return streamSSE(c, async (stream) => {
        try {
          for await (const chunk of streamChat(contextualMessages, model, config)) {
            await stream.writeSSE({
              data: chunk,
              event: 'message',
            })
          }
          
          await stream.writeSSE({
            data: '[DONE]',
            event: 'done',
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          await stream.writeSSE({
            data: JSON.stringify({ error: errorMessage }),
            event: 'error',
          })
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid request'
      return c.json({ error: errorMessage }, 400)
    }
  })

  app.get('/models', async (c) => {
    const models = await getAvailableModels()
    return c.json({ models })
  })

  app.post('/', async (c) => {
    try {
      const body = await c.req.json()
      const { messages, model } = chatRequestSchema.parse(body)
      
      let fullResponse = ''
      for await (const chunk of streamChat(messages, model, config)) {
        fullResponse += chunk
      }
      
      return c.json({ 
        content: fullResponse,
        model: model,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Chat error'
      return c.json({ error: errorMessage }, 400)
    }
  })

  return app
}