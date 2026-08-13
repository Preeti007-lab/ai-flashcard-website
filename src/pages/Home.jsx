import React, { useState } from 'react';
import { Sparkles, ArrowRight, BrainCircuit, ShieldCheck, Zap, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import Flashcard from '../components/Flashcard';
import { SAMPLE_DEMO_CARDS } from '../services/api';

export default function Home({ onNavigate, isSignedIn, onSignIn }) {
  const [demoIndex, setDemoIndex] = useState(0);
  const currentCard = SAMPLE_DEMO_CARDS[demoIndex];

  const handleNext = () => {
    setDemoIndex((prev) => (prev + 1) % SAMPLE_DEMO_CARDS.length);
  };

  const handlePrev = () => {
    setDemoIndex((prev) => (prev - 1 + SAMPLE_DEMO_CARDS.length) % SAMPLE_DEMO_CARDS.length);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-typewriter-badge">
          <Sparkles size={16} />
          <span>AI-POWERED ACTIVE RECALL ENGINE</span>
        </div>

        <h1 className="hero-title">
          Master Any Subject with <span>Warm Paper</span> Flashcards
        </h1>

        <p className="hero-subtitle">
          Transform complex topics into high-yield study decks in seconds. 
          Distraction-free tactile aesthetics, active recall questions, and seamless cloud library synchronization.
        </p>

        <div className="hero-cta-group">
          {isSignedIn ? (
            <button 
              type="button" 
              className="retro-btn retro-btn-primary"
              onClick={() => onNavigate('generate')}
            >
              <Sparkles size={16} />
              Open AI Generator
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button 
                type="button" 
                className="retro-btn retro-btn-primary"
                onClick={onSignIn || (() => onNavigate('generate'))}
              >
                <Sparkles size={16} />
                Get Started Free
                <ArrowRight size={16} />
              </button>

              <button 
                type="button" 
                className="retro-btn"
                onClick={() => onNavigate('generate')}
              >
                Try Generator
              </button>
            </>
          )}
        </div>
      </section>

      {/* Interactive Live Demo Deck */}
      <section className="demo-deck-section">
        <div className="section-label">
          Interactive Live Preview
        </div>

        <div className="study-carousel">
          <Flashcard 
            card={currentCard} 
            index={demoIndex} 
            total={SAMPLE_DEMO_CARDS.length} 
          />

          <div className="carousel-controls">
            <button 
              type="button"
              className="retro-btn retro-btn-sm"
              onClick={handlePrev}
              aria-label="Previous sample card"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <div style={{ textAlign: 'center', minWidth: '130px' }}>
              <span className="progress-indicator">
                Sample {demoIndex + 1} of {SAMPLE_DEMO_CARDS.length}
              </span>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${((demoIndex + 1) / SAMPLE_DEMO_CARDS.length) * 100}%` }}
                />
              </div>
            </div>

            <button 
              type="button"
              className="retro-btn retro-btn-sm"
              onClick={handleNext}
              aria-label="Next sample card"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-box">
            <BrainCircuit size={22} color="#1a1a1a" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>
            Instant AI Synthesis
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Input any subject, exam topic, or technical concept. Our AI extracts core principles into bite-sized questions and crystal-clear answers.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <Zap size={22} color="#1a1a1a" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>
            Study Focus Carousel
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Zero distractions. Switch between single-card immersive study mode and bird’s-eye grid overviews with smooth 3D tactile card flips.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <ShieldCheck size={22} color="#1a1a1a" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>
            Personal Cloud Library
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Protected by Clerk Authentication. Your flashcards are automatically organized by topic into expandable Manila folder decks.
          </p>
        </div>
      </section>
    </div>
  );
}
