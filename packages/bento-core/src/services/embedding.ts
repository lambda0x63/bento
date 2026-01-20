import { BentoConfig } from '../types';

interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

export class EmbeddingService {
  private apiKey: string;
  private siteUrl: string;
  private model = 'openai/text-embedding-3-small';

  constructor(config: BentoConfig) {
    this.apiKey = config.openRouterKey;
    this.siteUrl = config.siteUrl || `http://localhost:${config.port}`;
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': 'Bento RAG System',
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Embedding API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as EmbeddingResponse;
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to create embedding:', error);
      throw error;
    }
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': 'Bento RAG System',
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Embedding API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as EmbeddingResponse;
      return data.data.map(d => d.embedding);
    } catch (error) {
      console.error('Failed to create embeddings:', error);
      throw error;
    }
  }
}

// Factory function to create embedding service
export function createEmbeddingService(config: BentoConfig) {
  return new EmbeddingService(config);
}

// For backward compatibility in routes
export const embeddingService = {
  createEmbedding: (text: string, config: BentoConfig) => {
    const service = new EmbeddingService(config);
    return service.createEmbedding(text);
  },
  createEmbeddings: (texts: string[], config: BentoConfig) => {
    const service = new EmbeddingService(config);
    return service.createEmbeddings(texts);
  }
};