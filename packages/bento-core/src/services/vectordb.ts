import { connect, Table, Connection } from 'vectordb';
import { z } from 'zod';
import { BentoConfig } from '../types';
import path from 'path';
import fs from 'fs/promises';

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

export class VectorDBService {
  private connection: Connection | null = null;
  private documentsTable: Table<Document> | null = null;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async initialize() {
    try {
      // Ensure directory exists
      await fs.mkdir(this.dbPath, { recursive: true });
      
      // Connect to LanceDB
      this.connection = await connect(this.dbPath);
      
      // Create or open documents table
      const tables = await this.connection.tableNames();
      
      if (!tables.includes('documents')) {
        // Create table with initial schema
        this.documentsTable = await this.connection.createTable('documents', [
          {
            id: 'init',
            title: 'Initial Document',
            content: 'This is an initial document',
            metadata: {
              source: 'system',
              createdAt: new Date().toISOString(),
              fileType: 'text',
              chunkIndex: 0,
              totalChunks: 1,
            },
            vector: new Array(1536).fill(0), // OpenAI embedding dimension
          },
        ]) as any as Table<Document>;
        
        // Delete the initial document
        await this.documentsTable.delete('id = "init"');
      } else {
        this.documentsTable = await this.connection.openTable('documents') as any as Table<Document>;
      }
    } catch (error) {
      console.error('Failed to initialize VectorDB:', error);
      throw error;
    }
  }

  async addDocument(document: Omit<Document, 'vector'>, embedding: number[]) {
    if (!this.documentsTable) {
      throw new Error('VectorDB not initialized');
    }

    const doc: Document = {
      ...document,
      vector: embedding,
    };

    await this.documentsTable.add([doc]);
    return doc;
  }

  async searchDocuments(embedding: number[], limit: number = 5) {
    if (!this.documentsTable) {
      throw new Error('VectorDB not initialized');
    }

    const results = await (this.documentsTable as any)
      .search(embedding)
      .limit(limit)
      .execute();

    return results;
  }

  async getAllDocuments() {
    if (!this.documentsTable) {
      throw new Error('VectorDB not initialized');
    }

    const results = await (this.documentsTable as any).query().select().execute();
    return results;
  }

  async deleteDocument(id: string) {
    if (!this.documentsTable) {
      throw new Error('VectorDB not initialized');
    }

    await this.documentsTable.delete(`id = "${id}"`);
  }

  async clearAllDocuments() {
    if (!this.documentsTable) {
      throw new Error('VectorDB not initialized');
    }

    await this.documentsTable.delete('1 = 1');
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
      const basePath = path.resolve(this.config.vectorDB?.path || './data/vectors');
      const isolatedPath = path.join(basePath, 'isolated', isolationKey);
      
      const db = new VectorDBService(isolatedPath);
      await db.initialize();
      this.instances.set(key, db);
    }

    return this.instances.get(key)!;
  }

  private async getDefaultDB(): Promise<VectorDBService> {
    if (!this.instances.has('shared')) {
      const dbPath = path.resolve(this.config!.vectorDB?.path || './data/vectors', 'shared');
      const db = new VectorDBService(dbPath);
      await db.initialize();
      this.instances.set('shared', db);
    }

    return this.instances.get('shared')!;
  }
}

export const vectorDB = new VectorDBManager();