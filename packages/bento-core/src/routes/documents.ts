import { Hono } from 'hono';
import multer from 'multer';
import { BentoConfig } from '../types';
import { vectorDB } from '../services/vectordb';
import { embeddingService } from '../services/embedding';
import { documentProcessor } from '../utils/documentProcessor';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export function createDocumentRoutes(config: BentoConfig) {
  const app = new Hono();

  // Get isolation key from context
  function getIsolationKey(c: any): string | undefined {
    return c.get('isolationKey');
  }

  // Ensure upload directory exists (isolation-aware)
  async function ensureUploadDir(isolationKey?: string) {
    const baseDir = path.resolve(config.upload?.dir || './data/uploads');
    const uploadDir = isolationKey && config.isolation !== 'none'
      ? path.join(baseDir, 'isolated', isolationKey)
      : path.join(baseDir, 'shared');
    await fs.mkdir(uploadDir, { recursive: true });
    return uploadDir;
  }

  // Multer configuration
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      // Extract isolation key from request headers
      const isolationKey = (req as any).headers['x-session-id'] || (req as any).headers['x-isolation-key'];
      const uploadDir = await ensureUploadDir(isolationKey);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: config.upload?.maxFileSize || 10 * 1024 * 1024, // 10MB default
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'text/plain', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, TXT, and DOCX are allowed.'));
      }
    },
  });

  // Upload endpoint
  app.post('/upload', async (c) => {
    return new Promise((resolve) => {
      const uploadSingle = upload.single('file');
      
      uploadSingle(c.req.raw as any, c.res as any, async (err) => {
        if (err) {
          resolve(c.json({ error: err.message }, 400));
          return;
        }
        
        const file = (c.req.raw as any).file;
        if (!file) {
          resolve(c.json({ error: 'No file uploaded' }, 400));
          return;
        }
        
        try {
          const isolationKey = getIsolationKey(c);
          const db = await vectorDB.getDB(isolationKey);
          
          // Process the document
          const processed = await documentProcessor.processFile(file.path, file.originalname);
          
          // Chunk the text
          const chunks = documentProcessor.chunkText(processed.content);
          
          // Generate embeddings for each chunk
          const embeddings = await embeddingService.createEmbeddings(chunks, config);
          
          // Store each chunk with its embedding
          const documentId = crypto.randomUUID();
          const documents = await Promise.all(
            chunks.map(async (chunk, index) => {
              const doc = {
                id: `${documentId}-chunk-${index}`,
                title: processed.title,
                content: chunk,
                metadata: {
                  source: file.originalname,
                  createdAt: new Date().toISOString(),
                  fileType: processed.fileType,
                  chunkIndex: index,
                  totalChunks: chunks.length,
                },
              };
              
              return db.addDocument(doc, embeddings[index]);
            })
          );
          
          // Clean up uploaded file
          await fs.unlink(file.path);
          
          resolve(c.json({
            message: 'Document uploaded and processed successfully',
            documentId,
            chunks: documents.length,
          }));
        } catch (error) {
          console.error('Document processing error:', error);
          // Clean up uploaded file on error
          try {
            await fs.unlink(file.path);
          } catch {}
          
          resolve(c.json({ error: 'Failed to process document' }, 500));
        }
      });
    });
  });

  // Search endpoint
  const SearchSchema = z.object({
    query: z.string().min(1),
    limit: z.number().int().positive().default(5),
  });

  app.post('/search', async (c) => {
    try {
      const isolationKey = getIsolationKey(c);
      const db = await vectorDB.getDB(isolationKey);
      
      const body = await c.req.json();
      const { query, limit } = SearchSchema.parse(body);
      
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.createEmbedding(query, config);
      
      // Search for similar documents
      const results = await db.searchDocuments(queryEmbedding, limit);
      
      // Format results
      const formattedResults = results.map((result: any) => ({
        id: result.id,
        title: result.title,
        content: result.content,
        metadata: result.metadata,
        score: result._distance,
      }));
      
      return c.json({
        query,
        results: formattedResults,
      });
    } catch (error) {
      console.error('Search error:', error);
      return c.json({ error: 'Search failed' }, 500);
    }
  });

  // List documents endpoint
  app.get('/list', async (c) => {
    try {
      const isolationKey = getIsolationKey(c);
      const db = await vectorDB.getDB(isolationKey);
      
      const documents = await db.getAllDocuments();
      
      // Group documents by documentId
      const groupedDocs: Record<string, any> = {};
      
      documents.forEach((doc: any) => {
        const baseId = doc.id.split('-chunk-')[0];
        if (!groupedDocs[baseId]) {
          groupedDocs[baseId] = {
            id: baseId,
            title: doc.title,
            source: doc.metadata.source,
            createdAt: doc.metadata.createdAt,
            fileType: doc.metadata.fileType,
            chunks: doc.metadata.totalChunks,
          };
        }
      });
      
      return c.json({
        documents: Object.values(groupedDocs),
      });
    } catch (error) {
      console.error('List documents error:', error);
      return c.json({ error: 'Failed to list documents' }, 500);
    }
  });

  // Delete document endpoint
  app.delete('/:documentId', async (c) => {
    try {
      const isolationKey = getIsolationKey(c);
      const db = await vectorDB.getDB(isolationKey);
      
      const documentId = c.req.param('documentId');
      
      // Get all chunks for this document
      const allDocs = await db.getAllDocuments();
      const docsToDelete = allDocs.filter((doc: any) => 
        doc.id.startsWith(`${documentId}-chunk-`)
      );
      
      if (docsToDelete.length === 0) {
        return c.json({ error: 'Document not found' }, 404);
      }
      
      // Delete all chunks
      await Promise.all(
        docsToDelete.map((doc: any) => db.deleteDocument(doc.id))
      );
      
      return c.json({
        message: 'Document deleted successfully',
        deletedChunks: docsToDelete.length,
      });
    } catch (error) {
      console.error('Delete document error:', error);
      return c.json({ error: 'Failed to delete document' }, 500);
    }
  });

  // Clear all documents endpoint (session-aware)
  app.delete('/', async (c) => {
    try {
      const isolationKey = getIsolationKey(c);
      const db = await vectorDB.getDB(isolationKey);
      
      await db.clearAllDocuments();
      
      return c.json({
        message: 'All documents cleared successfully',
      });
    } catch (error) {
      console.error('Clear documents error:', error);
      return c.json({ error: 'Failed to clear documents' }, 500);
    }
  });

  return app;
}