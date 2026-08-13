import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from '@clerk/clerk-react';
import { Layers, Sparkles, BookOpen, LogIn, KeyRound } from 'lucide-react';

export default function Navbar({ activePage, onNavigate, hasClerkKey = true }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <button 
          type="button"
          className="nav-brand" 
          onClick={() => onNavigate('home')}
          title="PaperCard AI Home"
        >
          <div className="brand-icon-box">
            <Layers size={20} color="#1a1a1a" />
          </div>
          <span>PaperCard<span className="brand-tag">AI</span></span>
        </button>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link-btn ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activePage === 'generate' ? 'active' : ''}`}
            onClick={() => onNavigate('generate')}
          >
            <Sparkles size={15} />
            Generate
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activePage === 'my-cards' ? 'active' : ''}`}
            onClick={() => onNavigate('my-cards')}
          >
            <BookOpen size={15} />
            My Library
          </button>
        </nav>

        {/* Auth Group */}
        <div className="nav-auth-group">
          {hasClerkKey ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="retro-btn retro-btn-sm retro-btn-primary">
                    <LogIn size={14} />
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          ) : (
            <div className="paper-tag" title="Set VITE_CLERK_PUBLISHABLE_KEY in .env">
              <KeyRound size={12} style={{ marginRight: '4px' }} />
              Clerk Key Pending
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
