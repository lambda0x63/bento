# Chat API

The Chat API allows you to send messages and receive AI-generated responses with streaming support.

## Stream Chat Messages

Stream chat responses using Server-Sent Events.

```
POST /chat/stream
```

### Request Body

```typescript
{
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model?: string // Default: 'default-llm-model'
  ragEnabled?: boolean // Default: false
  temperature?: number // 0-2, Default: 0.7
  maxTokens?: number // Default: model's default
}
```

### Response

Server-Sent Events stream with the following events:

```
data: {"content": "Hello"}
data: {"content": " there"}
data: {"content": "!"}
data: [DONE]
```

### Example

```typescript
const response = await fetch('/api/bento/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Explain quantum computing' }
    ],
    model: 'advanced-llm-model',
    stream: true
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream complete');
      } else if (data) {
        const parsed = JSON.parse(data);
        process.stdout.write(parsed.content);
      }
    }
  }
}
```

### With RAG Context

Enable RAG to include document context:

```typescript
{
  messages: [
    { role: 'user', content: 'What does the report say about Q4?' }
  ],
  ragEnabled: true
}
```

## List Available Models

Get a list of available AI models.

```
GET /chat/models
```

### Response

```json
{
  "models": [
    {
      "id": "default-llm-model",
      "name": "Default LLM Model",
      "contextLength": 4096,
      "pricing": {
        "prompt": 0.0005,
        "completion": 0.0015
      }
    },
    {
      "id": "anthropic/model-name",
      "name": "Anthropic Model",
      "contextLength": 200000,
      "pricing": {
        "prompt": 0.003,
        "completion": 0.015
      }
    }
    // ... more models
  ]
}
```

### Example

```typescript
const response = await fetch('/api/bento/chat/models');
const { models } = await response.json();

// Display in a select dropdown
models.forEach(model => {
  console.log(`${model.name} (${model.id})`);
});
```

## Model Selection

### Recommended Models

For different use cases:

- **General chat**: Fast, cost-effective models
- **Complex reasoning**: Advanced models with better reasoning
- **Long context**: Models supporting 100k+ tokens
- **Code generation**: Models optimized for programming tasks

### Model Parameters

Common parameters across models:

- `temperature`: 0-2, controls randomness (0 = deterministic)
- `maxTokens`: Maximum response length
- `topP`: Nucleus sampling (0-1)
- `stopSequences`: Array of strings to stop generation

## Error Handling

### Rate Limiting

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

### Invalid Model

```json
{
  "error": "Model not found",
  "availableModels": ["default-llm-model", "..."]
}
```

### Context Length Exceeded

```json
{
  "error": "Context length exceeded",
  "maxLength": 4096,
  "requestLength": 5000
}
```

## Best Practices

1. **Stream for better UX**: Use streaming for real-time feedback
2. **Choose the right model**: Balance cost vs capability
3. **Handle errors gracefully**: Implement retry logic
4. **Limit message history**: Keep only relevant context
5. **Use system prompts**: Set behavior expectations

## Advanced Usage

### Custom System Prompts

```typescript
{
  messages: [
    {
      role: 'system',
      content: 'You are a helpful coding assistant. Always provide code examples.'
    },
    {
      role: 'user',
      content: 'How do I center a div?'
    }
  ]
}
```

### Conversation Management

```typescript
class ConversationManager {
  private messages: Message[] = []
  private maxMessages = 10
  
  addMessage(message: Message) {
    this.messages.push(message)
    
    // Keep only recent messages to avoid token limits
    if (this.messages.length > this.maxMessages) {
      // Keep system message if exists
      const systemMsg = this.messages.find(m => m.role === 'system')
      this.messages = systemMsg 
        ? [systemMsg, ...this.messages.slice(-this.maxMessages + 1)]
        : this.messages.slice(-this.maxMessages)
    }
  }
  
  getMessages() {
    return this.messages
  }
}
```

### Abort Requests

```typescript
const controller = new AbortController()

// Start request
fetch('/api/chat/stream', {
  signal: controller.signal,
  // ... other options
})

// Abort on user action
document.getElementById('stop-btn').onclick = () => {
  controller.abort()
}
```