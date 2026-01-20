import mammoth from 'mammoth';
import { promises as fs } from 'fs';

export interface ProcessedDocument {
  title: string;
  content: string;
  fileType: string;
}

export class DocumentProcessor {
  async processFile(filePath: string, fileName: string): Promise<ProcessedDocument> {
    const fileType = this.getFileType(fileName);
    const buffer = await fs.readFile(filePath);

    switch (fileType) {
      case 'pdf':
        return this.processPDF(buffer, fileName);
      case 'docx':
        return this.processDOCX(buffer, fileName);
      case 'txt':
        return this.processTXT(buffer, fileName);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension;
  }

  private async processPDF(buffer: Buffer, fileName: string): Promise<ProcessedDocument> {
    // Dynamic import to avoid pdf-parse initialization error
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return {
      title: fileName,
      content: data.text,
      fileType: 'pdf',
    };
  }

  private async processDOCX(buffer: Buffer, fileName: string): Promise<ProcessedDocument> {
    const result = await mammoth.extractRawText({ buffer });
    return {
      title: fileName,
      content: result.value,
      fileType: 'docx',
    };
  }

  private async processTXT(buffer: Buffer, fileName: string): Promise<ProcessedDocument> {
    return {
      title: fileName,
      content: buffer.toString('utf-8'),
      fileType: 'txt',
    };
  }

  // Text chunking for large documents
  chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentSize = 0;

    for (const sentence of sentences) {
      const sentenceSize = sentence.length;
      
      if (currentSize + sentenceSize > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Add overlap by keeping last few sentences
        const overlapSentences = currentChunk.split(/[.!?]+/).slice(-2).join('. ');
        currentChunk = overlapSentences + '. ' + sentence;
        currentSize = currentChunk.length;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
        currentSize += sentenceSize;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

export const documentProcessor = new DocumentProcessor();