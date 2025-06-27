# API Reference

Bento provides a RESTful API with streaming support for AI chat and document management.

## Base URL

The base URL depends on your setup:
- Next.js: `/api/bento`
- Standalone: `http://localhost:3001/api`

## Authentication

If using custom isolation, include your auth token:

```typescript
headers: {
  'Authorization': 'Bearer your-token',
  'x-isolation-key': 'user-id' // Optional
}
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/stream` | Stream chat responses |
| GET | `/chat/models` | List available models |
| POST | `/documents/upload` | Upload a document |
| GET | `/documents/list` | List all documents |
| POST | `/documents/search` | Search documents |
| DELETE | `/documents/:id` | Delete a document |

## Rate Limits

Bento itself doesn't impose rate limits, but OpenRouter does:
- Free tier: 20 requests/minute
- Paid tier: Based on your plan

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `UNAUTHORIZED` - Invalid API key
- `BAD_REQUEST` - Invalid request format
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal error

## Next Steps

- [Chat API →](/api/chat)
- [Documents API →](/api/documents)