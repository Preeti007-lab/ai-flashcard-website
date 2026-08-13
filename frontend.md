Act as a Senior Frontend Engineer. Recreate a Vite React application implementing a Retro Cozy Warm Paper themed UI for an AI Flashcards Generator with Clerk Authentication.

## Core Features & Requirements

### 1. Clerk Authentication
- Use `@clerk/clerk-react` for session management.
- Guard `/generate` and `/my-cards` routes using Clerk auth status (only authenticated users can access).
- Unauthenticated users visiting `/` (Home) should see a landing page, while authenticated users are redirected to `/generate`.

### 2. Retro Cozy Warm Paper Styling
- Typography: Use 'Plus Jakarta Sans' for body and 'JetBrains Mono' for headers, indicators, and buttons.
- Colors:
  - `--bg`: `#EFE9E3` (warm cream panels)
  - `--accent-bg` / `--code-bg`: `#D9CFC7` (card backs / badges / code blocks)
  - `--accent`: `#C9B59C` (tan accent highlights)
  - `--text`: `#1a1a1a` (near-black)
- Background Pattern: Apply a repeating dot grid on the `body`:
  `background: radial-gradient(var(--accent) 1px, transparent 1px); background-size: 20px 20px; background-color: var(--accent-bg);`
- Box Shadows: Create a floating, high-contrast style using sharp borders (`solid 2px #1a1a1a`) and flat offset box shadows (`4px 4px 0px #1a1a1a`). Avoid rounded border-radius.

---

## File Structure & Implementations

### 1. `src/main.jsx`
Initialize Clerk using publishable keys loaded from `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`. Avoid crash if key is missing:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Clerk Publishable Key is missing.");
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  )
}
```

### 2. `src/services/api.js`
Create an API client connecting to `import.meta.env.VITE_API_BASE` (strip trailing slashes to prevent preflight redirects). Inject Clerk JWT tokens using the `getToken` function:
```javascript
const rawApiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

async function authenticatedRequest(endpoint, options = {}, getToken) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (getToken) {
    try {
      const token = await getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Error fetching token:', err);
    }
  }
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText || 'Request failed.');
  }
  return response.json();
}

export const generateCards = (topic, count, getToken) => 
  authenticatedRequest('/generate', { method: 'POST', body: JSON.stringify({ topic, count }) }, getToken);

export const getSavedCards = (getToken) => 
  authenticatedRequest('/getcards', { method: 'GET' }, getToken);

export const deleteCard = (cardId, getToken) => 
  authenticatedRequest(`/deletecard/${cardId}`, { method: 'DELETE' }, getToken);
```

### 3. Page Layouts
- **Navigation Navbar**: Integrated in `App.jsx`. Uses Clerk `<SignedIn>` and `<SignedOut>` components to render:
  - If signed out: Login button.
  - If signed in: Links to `/generate` and `/my-cards`, and the Clerk `<UserButton />`.
- **`src/pages/Home.jsx`**: Landing page containing welcome info and a mock interactive flashcard carousel deck showing 3 hardcoded study slides. Users should be able to flip cards and navigate prev/next.
- **`src/pages/Generate.jsx`**: Form requesting topic string and card count (1-6). During loading, show a skeleton list loader. On success, show cards in a toggled single study carousel or full grid format.
- **`src/pages/MyCards.jsx`**: Fetch cards, group them by Topic, and display as expandable accordion folders. Inside each folder, users can view the cards or delete individual ones.
- **`src/components/Flashcard.jsx`**: A card component that toggles a `.flipped` class on click, utilizing CSS 3D transitions (`transform-style: preserve-3d`, `rotateY`) to reveal the answer.