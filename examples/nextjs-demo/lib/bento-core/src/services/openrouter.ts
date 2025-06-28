import OpenAI from 'openai'
import { BentoConfig } from '../types'

// OpenRouter is an OpenAI-compatible API
function createOpenRouterClient(config: BentoConfig) {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: config.openRouterKey,
    defaultHeaders: {
      'HTTP-Referer': config.siteUrl || `http://localhost:${config.port}`,
      'X-Title': 'Bento Chat',
    }
  })
}

// List of available models (commonly used ones)
export const MODELS = {
  // OpenAI
  'gpt-4-turbo': 'openai/gpt-4-turbo-preview',
  'gpt-4': 'openai/gpt-4',
  'gpt-3.5': 'openai/gpt-3.5-turbo',
  
  // Anthropic
  'claude-3-opus': 'anthropic/claude-3-opus',
  'claude-3-sonnet': 'anthropic/claude-3-sonnet',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  
  // Google
  'gemini-pro': 'google/gemini-pro',
  
  // Open Models
  'mixtral-8x7b': 'mistralai/mixtral-8x7b',
  'llama-3-70b': 'meta-llama/llama-3-70b',
  
  // Embedding
  'embedding-3-small': 'openai/text-embedding-3-small',
  'embedding-3-large': 'openai/text-embedding-3-large',
} as const

export type ModelId = keyof typeof MODELS

// Get available model information
export async function getAvailableModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    const data = await response.json() as { data: any[] }
    return data.data
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return Object.entries(MODELS).map(([key, value]) => ({
      id: value,
      name: key,
    }))
  }
}

// Streaming chat
export async function* streamChat(
  messages: OpenAI.ChatCompletionMessageParam[],
  model: string = MODELS['gpt-3.5'],
  config: BentoConfig
) {
  const openrouter = createOpenRouterClient(config)
  
  try {
    const stream = await openrouter.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('OpenRouter streaming error:', error)
    throw error
  }
}

// Create embeddings (for RAG)
export async function createEmbedding(text: string, config: BentoConfig) {
  const openrouter = createOpenRouterClient(config)
  
  try {
    const response = await openrouter.embeddings.create({
      model: MODELS['embedding-3-small'],
      input: text,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding error:', error)
    throw error
  }
}