/**
 * API Service for AI Flashcard Generator
 * Connects to VITE_API_BASE and injects Clerk Bearer token
 */

const rawApiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
export const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

/**
 * Execute an authenticated HTTP request with Clerk JWT
 */
async function authenticatedRequest(endpoint, options = {}, getToken) {
  const headers = { 
    'Content-Type': 'application/json', 
    ...options.headers 
  };

  if (getToken) {
    try {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('[Auth] Failed to acquire Clerk session token:', err);
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Unable to connect to backend at ${API_BASE}. Please ensure your server is running.`);
    }
    throw err;
  }
}

/**
 * Generate AI Flashcards
 * @param {string} topic 
 * @param {number} count 
 * @param {Function} getToken 
 */
export async function generateCards(topic, count = 3, getToken) {
  return authenticatedRequest(
    '/generate',
    {
      method: 'POST',
      body: JSON.stringify({ topic, count: Number(count) })
    },
    getToken
  );
}

/**
 * Retrieve saved cards for current authenticated user
 * @param {Function} getToken 
 */
export async function getSavedCards(getToken) {
  return authenticatedRequest('/getcards', { method: 'GET' }, getToken);
}

/**
 * Delete a card by ID
 * @param {string|number} cardId 
 * @param {Function} getToken 
 */
export async function deleteCard(cardId, getToken) {
  return authenticatedRequest(`/deletecard/${cardId}`, { method: 'DELETE' }, getToken);
}

/**
 * Sample pre-loaded mock cards for demo testing & interactive exploration
 */
export const SAMPLE_DEMO_CARDS = [
  {
    _id: 'demo-1',
    topic: 'Cognitive Science',
    question: 'What is the "Spacing Effect" in active recall and retention?',
    answer: 'Learning is significantly greater when study sessions are spaced out over time, rather than crammed into a single session, leveraging memory consolidation during rest.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'demo-2',
    topic: 'Computer Science',
    question: 'How do JavaScript Closures work in lexical scoping?',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), allowing inner functions to access outer variables even after the outer function finishes execution.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'demo-3',
    topic: 'Physics',
    question: 'What is the Second Law of Thermodynamics regarding Entropy?',
    answer: 'In any isolated system, the total entropy (a measure of disorder or randomness) always increases over time, dictating the thermodynamic arrow of time.',
    createdAt: new Date().toISOString()
  }
];
