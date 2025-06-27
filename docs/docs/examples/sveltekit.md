# SvelteKit Integration

This guide shows how to integrate Bento with a SvelteKit application.

## Quick Start

### 1. Create a new SvelteKit app

```bash
npx sv create my-app
cd my-app
npm install
```

### 2. Install Bento

```bash
npm install bento-core
```

### 3. Create server hook

Create `src/hooks.server.ts`:

```typescript
import { createBentoServer } from 'bento-core'
import type { Handle } from '@sveltejs/kit'

const server = createBentoServer({
  openRouterKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  corsOrigins: ['http://localhost:5173']
})

export const handle: Handle = async ({ event, resolve }) => {
  // Handle Bento API routes
  if (event.url.pathname.startsWith('/api/bento')) {
    return server.fetch(event.request)
  }
  
  return resolve(event)
}
```

### 4. Set up environment variables

Create `.env`:

```bash
VITE_OPENROUTER_API_KEY=your-key-here
```

### 5. Create a simple chat page

Create `src/routes/+page.svelte`:

```svelte
<script lang="ts">
  let messages: Array<{role: string, content: string}> = []
  let input = ''
  let loading = false
  
  async function sendMessage() {
    if (!input.trim() || loading) return
    
    const userMessage = input
    input = ''
    messages = [...messages, { role: 'user', content: userMessage }]
    
    loading = true
    
    try {
      const response = await fetch('/api/bento/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          stream: true
        })
      })
      
      // Add assistant message
      messages = [...messages, { role: 'assistant', content: '' }]
      
      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              loading = false
            } else if (data) {
              try {
                const parsed = JSON.parse(data)
                messages[messages.length - 1].content += parsed.content
                messages = messages // Trigger reactivity
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      loading = false
    }
  }
</script>

<div class="container">
  <div class="messages">
    {#each messages as message}
      <div class="message {message.role}">
        {message.content}
      </div>
    {/each}
  </div>
  
  <form on:submit|preventDefault={sendMessage}>
    <input
      bind:value={input}
      disabled={loading}
      placeholder="Type a message..."
    />
    <button type="submit" disabled={loading}>
      {loading ? 'Sending...' : 'Send'}
    </button>
  </form>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .messages {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .message {
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 5px;
  }
  
  .message.user {
    background: #e3f2fd;
    text-align: right;
  }
  
  .message.assistant {
    background: #f5f5f5;
  }
  
  form {
    display: flex;
    gap: 10px;
  }
  
  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    padding: 10px 20px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

## That's it!

You now have a working chat interface in your SvelteKit app. The Bento server is integrated through SvelteKit's hooks system and handles all API requests at `/api/bento/*`.

## Next Steps

- Add document upload functionality
- Implement user sessions
- Style with your preferred CSS framework
- Add more advanced features from the React demo

## Example Structure

For a more complete example with all features, check out the React demo in the `/examples/react-demo` folder. You can adapt its features to SvelteKit's patterns.