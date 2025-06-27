import { z } from 'zod';
import { BentoConfig } from '../types';

export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.object({
    source: z.string(),
    createdAt: z.string(),
    fileType: z.string(),
    chunkIndex: z.number(),
    totalChunks: z.number(),
  }),
  vector: z.array(z.number()),
});

export type Document = z.infer<typeof DocumentSchema>;

// Mock VectorDB for Vercel deployment
export class VectorDBService {
  private documents: Map<string, Document> = new Map();

  async initialize() {
    console.log('VectorDB initialized (in-memory mode for serverless)');
  }

  async addDocument(document: Omit<Document, 'vector'>, embedding: number[]) {
    const doc: Document = {
      ...document,
      vector: embedding,
    };

    this.documents.set(doc.id, doc);
    return doc;
  }

  async searchDocuments(embedding: number[], limit: number = 5) {
    // Simple cosine similarity search
    const results = Array.from(this.documents.values())
      .map(doc => ({
        ...doc,
        score: this.cosineSimilarity(embedding, doc.vector)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  async getAllDocuments() {
    return Array.from(this.documents.values());
  }

  async deleteDocument(id: string) {
    this.documents.delete(id);
  }

  async clearAllDocuments() {
    this.documents.clear();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// Session-aware vector DB manager
class VectorDBManager {
  private instances: Map<string, VectorDBService> = new Map();
  private config: BentoConfig | null = null;

  async initialize(config: BentoConfig) {
    this.config = config;
  }

  async getDB(isolationKey?: string): Promise<VectorDBService> {
    if (!this.config) {
      throw new Error('VectorDB manager not initialized');
    }

    // No isolation or no key provided
    if (this.config.isolation === 'none' || !isolationKey) {
      return this.getDefaultDB();
    }

    // Get or create isolated instance
    const key = `isolated_${isolationKey}`;
    if (!this.instances.has(key)) {
      const db = new VectorDBService();
      await db.initialize();
      this.instances.set(key, db);
    }

    return this.instances.get(key)!;
  }

  private async getDefaultDB(): Promise<VectorDBService> {
    if (!this.instances.has('shared')) {
      const db = new VectorDBService();
      await db.initialize();
      this.instances.set('shared', db);
    }

    return this.instances.get('shared')!;
  }
}

export const vectorDB = new VectorDBManager();