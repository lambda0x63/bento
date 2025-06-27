# Documents API

API endpoints for document management and RAG functionality.

## Upload Document

Upload a document to the vector database.

```
POST /documents/upload
```

### Request

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

#### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Document file (PDF, DOCX, TXT) |
| metadata | JSON | No | Additional metadata |

### Response

```json
{
  "message": "Document uploaded and processed successfully",
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "chunks": 15
}
```

### Example

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('metadata', JSON.stringify({
  category: 'technical',
  tags: ['api', 'documentation']
}))

const response = await fetch('/api/bento/documents/upload', {
  method: 'POST',
  headers: {
    'x-session-id': sessionId // If using session isolation
  },
  body: formData
})
```

### Error Responses

```json
// Invalid file type
{
  "error": "Invalid file type. Only PDF, TXT, and DOCX are allowed."
}

// File too large
{
  "error": "File size exceeds limit of 10MB"
}

// Processing error
{
  "error": "Failed to process document"
}
```

## List Documents

Get all uploaded documents.

```
GET /documents/list
```

### Request

- **Method**: `GET`
- **Headers**: Include isolation key if applicable

### Response

```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "API Documentation.pdf",
      "source": "api-docs.pdf",
      "createdAt": "2024-03-20T10:30:00Z",
      "fileType": "pdf",
      "chunks": 15
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "User Guide",
      "source": "guide.docx",
      "createdAt": "2024-03-19T15:45:00Z",
      "fileType": "docx",
      "chunks": 23
    }
  ]
}
```

### Example

```typescript
const response = await fetch('/api/bento/documents/list', {
  headers: {
    'x-session-id': sessionId
  }
})

const { documents } = await response.json()
```

## Search Documents

Search documents using semantic similarity.

```
POST /documents/search
```

### Request

- **Method**: `POST`
- **Content-Type**: `application/json`

#### Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | Search query |
| limit | number | No | Max results (default: 5) |

### Response

```json
{
  "query": "API authentication",
  "results": [
    {
      "id": "550e8400-chunk-3",
      "title": "API Documentation.pdf",
      "content": "Authentication is handled via API keys...",
      "metadata": {
        "source": "api-docs.pdf",
        "createdAt": "2024-03-20T10:30:00Z",
        "fileType": "pdf",
        "chunkIndex": 3,
        "totalChunks": 15
      },
      "score": 0.92
    },
    {
      "id": "550e8400-chunk-7",
      "title": "API Documentation.pdf",
      "content": "Bearer tokens can be used for authentication...",
      "metadata": {
        "source": "api-docs.pdf",
        "createdAt": "2024-03-20T10:30:00Z",
        "fileType": "pdf",
        "chunkIndex": 7,
        "totalChunks": 15
      },
      "score": 0.87
    }
  ]
}
```

### Example

```typescript
const response = await fetch('/api/bento/documents/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId
  },
  body: JSON.stringify({
    query: 'How to authenticate API requests?',
    limit: 3
  })
})

const { results } = await response.json()

// Display results
results.forEach(result => {
  console.log(`Found in ${result.title} (score: ${result.score})`)
  console.log(result.content)
})
```

## Delete Document

Delete a document and all its chunks.

```
DELETE /documents/:documentId
```

### Request

- **Method**: `DELETE`
- **URL Parameter**: `documentId` - The document UUID

### Response

```json
{
  "message": "Document deleted successfully",
  "deletedChunks": 15
}
```

### Example

```typescript
const documentId = '550e8400-e29b-41d4-a716-446655440000'

const response = await fetch(`/api/bento/documents/${documentId}`, {
  method: 'DELETE',
  headers: {
    'x-session-id': sessionId
  }
})
```

### Error Responses

```json
// Document not found
{
  "error": "Document not found",
  "code": "NOT_FOUND"
}
```

## Clear All Documents

Delete all documents (use with caution).

```
DELETE /documents
```

### Request

- **Method**: `DELETE`
- **Headers**: Include isolation key if applicable

### Response

```json
{
  "message": "All documents cleared successfully"
}
```

### Example

```typescript
// Confirm before clearing
if (confirm('Delete all documents?')) {
  const response = await fetch('/api/bento/documents', {
    method: 'DELETE',
    headers: {
      'x-session-id': sessionId
    }
  })
}
```

## Document Processing

### Supported Formats

| Format | MIME Type | Max Size | Notes |
|--------|-----------|----------|-------|
| PDF | application/pdf | 10MB | Text extraction only |
| DOCX | application/vnd.openxmlformats-officedocument.wordprocessingml.document | 10MB | Formatted text |
| TXT | text/plain | 10MB | Plain text |

### Text Chunking

Documents are automatically chunked for optimal retrieval:

- **Default chunk size**: 1000 characters
- **Chunk overlap**: 200 characters
- **Min chunk size**: 100 characters

### Embeddings

- **Model**: OpenAI text-embedding-ada-002
- **Dimensions**: 1536
- **Processing**: Automatic on upload

## Rate Limits

Document API endpoints have the following limits:

| Endpoint | Rate Limit | Burst |
|----------|------------|-------|
| Upload | 10/minute | 20 |
| Search | 100/minute | 200 |
| List | 100/minute | 200 |
| Delete | 20/minute | 40 |

## Best Practices

### 1. Document Preparation

```typescript
// Clean document before upload
async function prepareDocument(file: File) {
  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large')
  }
  
  // Validate type
  const validTypes = ['application/pdf', 'text/plain', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  return file
}
```

### 2. Batch Processing

```typescript
// Upload multiple documents
async function uploadBatch(files: File[]) {
  const results = await Promise.all(
    files.map(file => uploadDocument(file))
  )
  
  return results
}
```

### 3. Search Optimization

```typescript
// Cache frequent searches
const searchCache = new Map()

async function cachedSearch(query: string) {
  const cacheKey = query.toLowerCase().trim()
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)
  }
  
  const results = await searchDocuments(query)
  searchCache.set(cacheKey, results)
  
  // Clear cache after 5 minutes
  setTimeout(() => searchCache.delete(cacheKey), 5 * 60 * 1000)
  
  return results
}
```

### 4. Error Handling

```typescript
async function safeUpload(file: File) {
  try {
    const result = await uploadDocument(file)
    return { success: true, result }
  } catch (error) {
    console.error('Upload failed:', error)
    
    // Retry logic for network errors
    if (error.message.includes('network')) {
      await new Promise(r => setTimeout(r, 1000))
      return safeUpload(file) // Retry once
    }
    
    return { success: false, error: error.message }
  }
}
```

## Security Considerations

1. **File Validation**: Always validate file type and size
2. **Filename Sanitization**: Server sanitizes filenames
3. **Content Scanning**: Consider virus scanning for production
4. **Access Control**: Use isolation for multi-user apps
5. **Rate Limiting**: Implement client-side throttling