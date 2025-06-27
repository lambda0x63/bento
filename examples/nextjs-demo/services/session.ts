// Session management for demo mode
const SESSION_KEY = 'bento-session-id';

export function getSessionId(): string {
  // Check if we already have a session ID
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Generate a new session ID using crypto.randomUUID or fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID().replace(/-/g, '');
    } else {
      // Fallback for older browsers
      sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Add session ID to request headers
export function getAuthHeaders(): HeadersInit {
  return {
    'x-session-id': getSessionId(),
  };
}