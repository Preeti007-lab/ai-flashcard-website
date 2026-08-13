import React, { useState } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { CheckCircle2, AlertCircle, Info, KeyRound } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Generate from './pages/Generate';
import MyCards from './pages/MyCards';

export default function App({ hasClerkKey = true }) {
  const [activePage, setActivePage] = useState('home');
  const [toasts, setToasts] = useState([]);
  
  // Safe Clerk auth hooks inside ClerkProvider
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  // Handler for modal sign in
  const openSignIn = () => {
    try {
      if (hasClerkKey && clerk?.openSignIn) {
        clerk.openSignIn();
      } else {
        showToast('Running in demo mode. Explore all flashcard generation and study features freely!', 'info');
      }
    } catch (err) {
      console.warn('Sign-in modal note:', err);
    }
  };

  // Trigger toast notifications
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Route Navigation
  const handleNavigate = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      {/* Sticky Header */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        hasClerkKey={hasClerkKey}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {/* Helper info banner if Clerk key is pending */}
        {!hasClerkKey && (
          <div className="info-banner">
            <KeyRound size={20} color="#1a1a1a" />
            <div>
              <strong>Quick Setup Tip:</strong> Add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>.env</code> to activate live cloud authentication and sync. Demo mode is currently active.
            </div>
          </div>
        )}

        {/* Page Switcher */}
        {activePage === 'home' && (
          <Home
            onNavigate={handleNavigate}
            isSignedIn={isSignedIn}
            onSignIn={openSignIn}
          />
        )}

        {activePage === 'generate' && (
          <Generate
            onNavigate={handleNavigate}
            showToast={showToast}
            hasClerkKey={hasClerkKey}
          />
        )}

        {activePage === 'my-cards' && (
          <MyCards
            onNavigate={handleNavigate}
            showToast={showToast}
            hasClerkKey={hasClerkKey}
          />
        )}
      </main>

      {/* Retro Footer */}
      <footer style={{ 
        borderTop: 'var(--border)', 
        background: 'var(--bg)', 
        padding: '1.75rem 1.5rem', 
        marginTop: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ 
          maxWidth: '1140px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>PaperCard AI</span>
            <span>— Retro Cozy Stationery for Active Recall</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="paper-tag">Vite + React</span>
            <span className="paper-tag paper-tag-accent">Clerk Auth</span>
          </div>
        </div>
      </footer>

      {/* Floating Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast ${toast.type === 'error' ? 'toast-error' : toast.type === 'info' ? 'toast-info' : 'toast-success'}`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={18} color="var(--danger)" />
            ) : toast.type === 'info' ? (
              <Info size={18} color="#1a1a1a" />
            ) : (
              <CheckCircle2 size={18} color="var(--success)" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
