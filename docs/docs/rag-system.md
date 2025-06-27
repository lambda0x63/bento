# RAG System

Retrieval-Augmented Generation (RAG) allows your LLM to answer questions based on your documents.

## How It Works

1. **Upload documents** → Parse and chunk text
2. **Generate embeddings** → Convert chunks to vectors
3. **Store in vector DB** → Save for fast retrieval
4. **Query time** → Find relevant chunks and include in context

## Supported Formats

- **PDF** - Text extraction from PDF files
- **DOCX** - Microsoft Word documents
- **TXT** - Plain text files

## Basic Usage

### Enable RAG in Chat

```typescript
const response = await fetch('/api/bento/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What does the report say about revenue?' }
    ],
    ragEnabled: true // Enable RAG
  })
})
```

### Upload Documents

```typescript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/bento/documents/upload', {
  method: 'POST',
  body: formData
})

const { documentId, chunks } = await response.json()
console.log(`Uploaded ${chunks} chunks`)
```

### List Documents

```typescript
const response = await fetch('/api/bento/documents/list')
const { documents } = await response.json()

documents.forEach(doc => {
  console.log(`${doc.title} - ${doc.chunks} chunks`)
})
```

### Search Documents

```typescript
const response = await fetch('/api/bento/documents/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'revenue growth',
    limit: 5
  })
})

const { results } = await response.json()
```

## Configuration

### Chunk Settings

Control how documents are split:

```typescript
const server = createBentoServer({
  openRouterKey: 'your-key',
  chunking: {
    size: 1000,      // Characters per chunk
    overlap: 200,    // Overlap between chunks
    minSize: 100     // Minimum chunk size
  }
})
```

### Embedding Model

Currently uses OpenAI's `text-embedding-ada-002` via OpenRouter.

## Advanced Features

### Document Metadata

Add metadata during upload:

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('metadata', JSON.stringify({
  category: 'financial',
  year: 2024,
  department: 'sales'
}))
```

### Filter by Metadata

```typescript
// Coming soon: metadata filtering
const results = await vectorDB.searchDocuments(embedding, {
  limit: 5,
  filter: {
    category: 'financial',
    year: { $gte: 2023 }
  }
})
```

### Custom Processing

Override default document processing:

```typescript
import { documentProcessor } from 'bento-core'

// Add custom parser
documentProcessor.addParser('.csv', async (filePath) => {
  // Custom CSV parsing logic
  return {
    title: 'CSV File',
    content: parsedContent,
    metadata: { type: 'csv' }
  }
})
```

## Best Practices

### 1. Document Preparation

- **Clean text**: Remove headers/footers
- **Logical sections**: Split by topics
- **Meaningful titles**: Help with retrieval

### 2. Chunk Size

- **Smaller chunks** (500-1000): Better precision
- **Larger chunks** (2000-3000): More context
- **Overlap**: 10-20% prevents context loss

### 3. Query Optimization

```typescript
// Good: Specific query
"What was the Q4 2023 revenue?"

// Bad: Too vague
"Tell me about the company"
```

### 4. Context Window Management

```typescript
// Limit RAG results to fit context
const MAX_CONTEXT_TOKENS = 2000
const MAX_RESULTS = 3 // Adjust based on chunk size
```

## Performance

### Vector DB Stats

- **Index time**: ~100ms per chunk
- **Search time**: ~50ms for 10k documents
- **Storage**: ~1KB per chunk

### Optimization Tips

1. **Pre-process documents**: Clean before upload
2. **Batch uploads**: Process multiple files together
3. **Cache embeddings**: Reuse for similar queries

## Troubleshooting

### Poor Results

1. **Check chunk size**: Too small loses context
2. **Improve queries**: Be specific
3. **Document quality**: Ensure clean text

### Slow Performance

1. **Reduce chunk overlap**: Less processing
2. **Limit search results**: Fewer to process
3. **Use SSD**: Faster vector operations

### Memory Issues

1. **Stream large files**: Process in chunks
2. **Cleanup old documents**: Remove unused
3. **Monitor vector DB size**: Regular maintenance

## Security

### Access Control

With custom isolation:

```typescript
// User can only search their documents
const db = await vectorDB.getDB(userId)
const results = await db.searchDocuments(query)
```

### Sensitive Data

1. **Don't upload**: PII, credentials, secrets
2. **Sanitize**: Remove sensitive info first
3. **Encrypt**: Use disk encryption

## Roadmap

- [ ] More file formats (Excel, Markdown)
- [ ] Metadata filtering
- [ ] Incremental updates
- [ ] Multi-language support
- [ ] Custom embeddings models

## Examples

- [Document Q&A Bot](/examples/document-qa)
- [Knowledge Base](/examples/knowledge-base)
- [Research Assistant](/examples/research)