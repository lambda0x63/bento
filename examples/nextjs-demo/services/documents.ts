import { getAuthHeaders } from './session'

export interface Document {
  source: string
  fileType: string
  chunks: Array<{
    id: string
    title: string
    content: string
    metadata: {
      source: string
      createdAt: string
      fileType: string
      chunkIndex: number
      totalChunks: number
    }
  }>
  createdAt: string
}

export interface UploadResponse {
  message: string
  documentId: string
  chunks: number
}

export interface SearchResponse {
  query: string
  results: Array<{
    id: string
    title: string
    content: string
    metadata: {
      source: string
      createdAt: string
      fileType: string
      chunkIndex: number
      totalChunks: number
    }
    score: number
  }>
}

export class DocumentService {
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/bento-proxy?path=/documents/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    return response.json()
  }

  async listDocuments(): Promise<{ documents: Document[] }> {
    const response = await fetch('/api/bento-proxy?path=/documents/list', {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }

    return response.json()
  }

  async searchDocuments(query: string, limit = 5): Promise<SearchResponse> {
    const response = await fetch('/api/bento-proxy?path=/documents/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ query, limit }),
    })

    if (!response.ok) {
      throw new Error('Search failed')
    }

    return response.json()
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`/api/bento-proxy?path=/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Delete failed')
    }
  }
}