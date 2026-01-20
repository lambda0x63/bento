# User Isolation

Bento provides flexible user isolation strategies for managing vector databases and uploads per user/session.

## Overview

By default, all users share the same vector database. This is fine for personal projects, but for multi-user applications, you'll want to isolate each user's data.

## Isolation Strategies

### 1. No Isolation (Default)

All users share the same vector database and uploads.

```typescript
const server = createBentoServer({
  openRouterKey: 'your-key',
  isolation: 'none' // or omit this field
})
```

**Use cases:**
- Personal projects
- Single-user applications
- Internal team tools where sharing is desired

### 2. Session-based Isolation

Automatic session management with browser-based session IDs.

```typescript
const server = createBentoServer({
  openRouterKey: 'your-key',
  isolation: 'session'
})
```

**Features:**
- Automatic session ID generation
- Sessions expire after 24 hours of inactivity
- Perfect for demos and temporary usage

**Frontend integration:**
```typescript
// Store session ID in localStorage
const sessionId = localStorage.getItem('session-id') || crypto.randomUUID()
localStorage.setItem('session-id', sessionId)

// Include in all requests
fetch('/api/chat', {
  headers: {
    'x-session-id': sessionId
  }
})
```

### 3. Custom Isolation

Integrate with your existing authentication system.

```typescript
const server = createBentoServer({
  openRouterKey: 'your-key',
  isolation: 'custom'
})

// Add your auth middleware BEFORE Bento routes
server.getApp().use('*', async (c, next) => {
  const userId = await getUserFromToken(c.req.header('Authorization'))
  c.set('isolationKey', userId)
  await next()
})
```

**Alternative: Use header directly:**
```typescript
// Frontend
fetch('/api/chat', {
  headers: {
    'x-isolation-key': currentUser.id
  }
})
```

## Directory Structure

Based on your isolation strategy, data is organized as:

```
data/
├── vectors/
│   ├── shared/          # isolation: 'none'
│   └── isolated/        # isolation: 'session' or 'custom'
│       ├── session-abc123/
│       └── user-456/
└── uploads/
    ├── shared/
    └── isolated/
        ├── session-abc123/
        └── user-456/
```

## Advanced Usage

### Custom Session Expiry

Override the default 24-hour expiry:

```typescript
// In your server setup
import { cleanupSessions } from 'bento-core/middleware/isolation'

// Run cleanup every 30 minutes
setInterval(() => {
  cleanupSessions(server.config)
}, 30 * 60 * 1000)
```

### Multi-tenant SaaS

Use organization ID as isolation key:

```typescript
server.getApp().use('*', async (c, next) => {
  const user = await getUser(c)
  c.set('isolationKey', user.organizationId)
  await next()
})
```

### Sharing Documents Between Users

Temporarily access another user's documents:

```typescript
server.getApp().get('/shared/:userId/documents', async (c) => {
  const targetUserId = c.req.param('userId')
  
  // Check permissions
  if (!canAccessUserDocuments(c.get('user'), targetUserId)) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  
  // Override isolation for this request
  c.set('isolationKey', targetUserId)
  
  // Now document routes will access target user's data
  return c.redirect(`/api/documents/list`)
})
```

## Migration Guide

### From Shared to Isolated

When enabling isolation on an existing deployment:

1. Your existing data remains in the `shared` folder
2. New isolated data is created in `isolated/*` folders
3. Manually migrate if needed:

```bash
# Move shared data to a specific user
mv data/vectors/shared/* data/vectors/isolated/user-123/
```

### Handling Legacy Sessions

For gradual migration:

```typescript
server.getApp().use('*', async (c, next) => {
  let isolationKey = c.get('isolationKey')
  
  // Fallback to shared for old users
  if (!isolationKey && isLegacyUser(c)) {
    c.set('isolationKey', 'shared')
  }
  
  await next()
})
```

## Best Practices

1. **Start Simple**: Use session isolation for prototypes
2. **Plan for Growth**: Switch to custom when adding auth
3. **Use Meaningful Keys**: User IDs, not emails or names
4. **Monitor Usage**: Each user gets their own vector DB
5. **Implement Cleanup**: Remove inactive user data

## Performance Considerations

- Each isolated DB is loaded on first access
- Consider caching for frequently accessed users
- Monitor disk usage as users grow
- Use SSD for better performance

## Security Notes

- Session IDs are not cryptographically secure tokens
- For production, use your auth system's user IDs
- Never expose isolation keys in URLs or logs
- Validate isolation keys to prevent directory traversal

## Troubleshooting

### Sessions Not Persisting

Check:
- Cookies/localStorage enabled
- CORS includes `credentials: true`
- Session ID format (32 hex characters)

### Isolation Not Working

Check:
- Middleware order (auth before Bento)
- `isolationKey` set in context
- File permissions on data directories

### Performance Issues

- Limit concurrent vector DB instances
- Implement LRU cache for DB connections
- Use connection pooling in production