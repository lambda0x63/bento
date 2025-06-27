import { getAuthHeaders } from './session'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
}

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  model: string
  ragEnabled: boolean
}

export class ChatService {
  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: string) => void
  ) {
    try {
      const response = await fetch('/api/bento/chat/stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') {
                onDone()
              } else if (data) {
                onChunk(data)
              }
            } else if (line.startsWith('event: error')) {
              const nextLine = lines[lines.indexOf(line) + 1]
              if (nextLine?.startsWith('data: ')) {
                const errorData = JSON.parse(nextLine.slice(6))
                onError(errorData.error || 'Stream error')
              }
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async getAvailableModels() {
    try {
      const response = await fetch('/api/bento/chat/models', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      return data.models || []
    } catch (error) {
      console.error('Failed to fetch models:', error)
      return []
    }
  }
}