import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

// Retrieve Clerk Publishable Key or fallback to standard demo key to guarantee ClerkProvider context
const ENV_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const DEMO_FALLBACK_KEY = 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k'

const hasCustomKey = Boolean(ENV_KEY && ENV_KEY.trim() !== '' && !ENV_KEY.includes('placeholder'))
const PUBLISHABLE_KEY = hasCustomKey ? ENV_KEY.trim() : DEMO_FALLBACK_KEY

if (!hasCustomKey) {
  console.info('[PaperCard AI] Running with demo Clerk authentication context. Set VITE_CLERK_PUBLISHABLE_KEY in .env for custom live sync.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App hasClerkKey={hasCustomKey} />
    </ClerkProvider>
  </React.StrictMode>
)
