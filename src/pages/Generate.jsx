import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Sparkles, LayoutGrid, Layers, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, BookmarkPlus } from 'lucide-react';
import Flashcard from '../components/Flashcard';
import SkeletonLoader from '../components/SkeletonLoader';
import { generateCards, SAMPLE_DEMO_CARDS } from '../services/api';

const PRESET_TOPICS = [
  'JavaScript Closures & Scope',
  'Photosynthesis Stages',
  'Distributed System Design',
  'World War II Timeline',
  'French Essential Phrases',
  'Microeconomics Supply & Demand'
];

export default function Generate({ onNavigate, showToast, hasClerkKey }) {
  const { getToken, isSignedIn } = useAuth();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCards, setGeneratedCards] = useState(null);
  const [viewMode, setViewMode] = useState('study'); // 'study' | 'grid'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch cards from API
      const result = await generateCards(
        topic.trim(), 
        count, 
        hasClerkKey && isSignedIn ? getToken : null
      );

      const cardsArray = Array.isArray(result) ? result : (result.cards || []);
      
      if (cardsArray.length === 0) {
        throw new Error('No flashcards could be generated for this topic. Please try a different topic.');
      }

      setGeneratedCards(cardsArray);
      setCurrentCardIndex(0);
      showToast?.('Flashcard deck generated successfully!', 'success');
    } catch (err) {
      console.warn('API generation note:', err.message);
      setError(err.message);

      // Offer fallback mock generation if backend is unreachable
      if (err.message.includes('connect') || err.message.includes('fetch') || err.message.includes('Failed')) {
        const mockFallback = [
          {
            _id: `gen-${Date.now()}-1`,
            topic: topic.trim(),
            question: `What is the fundamental mechanism behind ${topic.trim()}?`,
            answer: `It operates by systematically structuring core properties, ensuring state isolation and repeatable execution patterns.`
          },
          {
            _id: `gen-${Date.now()}-2`,
            topic: topic.trim(),
            question: `What are the primary advantages of mastering ${topic.trim()}?`,
            answer: `Deep retention of foundational rules accelerates problem-solving velocity and prevents common pitfalls during complex implementations.`
          },
          {
            _id: `gen-${Date.now()}-3`,
            topic: topic.trim(),
            question: `How does one test or verify accuracy in ${topic.trim()}?`,
            answer: `By establishing targeted validation scenarios, verifying edge cases, and continuously reviewing active recall flashcards.`
          }
        ].slice(0, count);

        setGeneratedCards(mockFallback);
        setCurrentCardIndex(0);
        showToast?.('Generated preview cards (Offline Demo Mode)', 'success');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!generatedCards) return;
    setCurrentCardIndex((prev) => (prev + 1) % generatedCards.length);
  };

  const handlePrev = () => {
    if (!generatedCards) return;
    setCurrentCardIndex((prev) => (prev - 1 + generatedCards.length) % generatedCards.length);
  };

  return (
    <div>
      {/* Generator Form Panel */}
      <div className="paper-panel" style={{ marginBottom: '2.5rem' }}>
        <div className="paper-panel-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} color="#1a1a1a" />
              AI Flashcard Studio
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Type any topic or select a prompt below to synthesize study cards instantly.
            </p>
          </div>
          <span className="paper-tag paper-tag-accent">
            GPT / Claude / Gemini Ready
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="retro-input-group">
            <label className="retro-label" htmlFor="topic-input">
              <span>Study Topic / Subject</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required</span>
            </label>
            <input
              id="topic-input"
              type="text"
              className="retro-input"
              placeholder="e.g. Asynchronous JavaScript, Quantum Computing, Cell Biology..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              autoFocus
            />

            {/* Topic Suggestion Chips */}
            <div className="topic-chips">
              {PRESET_TOPICS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="topic-chip"
                  onClick={() => setTopic(preset)}
                  disabled={loading}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.5rem', alignItems: 'flex-end' }}>
            <div className="retro-input-group" style={{ marginBottom: 0 }}>
              <label className="retro-label" htmlFor="card-count">
                <span>Card Count ({count})</span>
                <span className="mono" style={{ fontSize: '0.75rem' }}>1 to 6 cards</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`retro-btn retro-btn-sm ${count === num ? 'retro-btn-primary' : ''}`}
                    onClick={() => setCount(num)}
                    style={{ flex: 1, padding: '0.5rem 0' }}
                    disabled={loading}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="retro-btn retro-btn-primary"
              disabled={loading || !topic.trim()}
              style={{ width: '100%', height: '42px' }}
            >
              <Sparkles size={16} />
              {loading ? 'Synthesizing...' : 'Generate Flashcards'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && <SkeletonLoader count={count} />}

      {/* Generated Cards Result */}
      {!loading && generatedCards && generatedCards.length > 0 && (
        <div>
          {/* Controls Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem',
            marginBottom: '1.5rem',
            background: 'var(--bg)',
            border: 'var(--border)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <span className="paper-tag paper-tag-accent" style={{ marginRight: '0.6rem' }}>
                {topic}
              </span>
              <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {generatedCards.length} Cards Generated
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`retro-btn retro-btn-sm ${viewMode === 'study' ? 'retro-btn-primary' : ''}`}
                onClick={() => setViewMode('study')}
                title="Single Card Study Focus Carousel"
              >
                <Layers size={14} />
                Study Mode
              </button>

              <button
                type="button"
                className={`retro-btn retro-btn-sm ${viewMode === 'grid' ? 'retro-btn-primary' : ''}`}
                onClick={() => setViewMode('grid')}
                title="View All Cards in Grid"
              >
                <LayoutGrid size={14} />
                Grid View
              </button>

              <button
                type="button"
                className="retro-btn retro-btn-sm"
                onClick={() => onNavigate('my-cards')}
                title="View Saved Library"
              >
                <BookmarkPlus size={14} />
                Library
              </button>
            </div>
          </div>

          {/* View Modes */}
          {viewMode === 'study' ? (
            <div className="study-carousel">
              <Flashcard
                card={generatedCards[currentCardIndex]}
                index={currentCardIndex}
                total={generatedCards.length}
              />

              <div className="carousel-controls">
                <button
                  type="button"
                  className="retro-btn retro-btn-sm"
                  onClick={handlePrev}
                  aria-label="Previous generated card"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div style={{ textAlign: 'center', minWidth: '140px' }}>
                  <span className="progress-indicator">
                    Card {currentCardIndex + 1} of {generatedCards.length}
                  </span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${((currentCardIndex + 1) / generatedCards.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="retro-btn retro-btn-sm"
                  onClick={handleNext}
                  aria-label="Next generated card"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="cards-grid">
              {generatedCards.map((card, idx) => (
                <Flashcard
                  key={card._id || card.id || idx}
                  card={card}
                  index={idx}
                  total={generatedCards.length}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
