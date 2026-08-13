import React, { useState } from 'react';
import { RotateCw, Trash2, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

export default function Flashcard({ 
  card, 
  onDelete, 
  showDelete = false, 
  index = null, 
  total = null 
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e) => {
    // Avoid flipping when clicking specific action buttons
    if (e.target.closest('.no-flip')) return;
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div 
      className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${card.topic}. Click or press space to flip.`}
    >
      <div className="flashcard-inner">
        {/* FRONT SIDE */}
        <div className="flashcard-front">
          <div className="card-header-bar">
            <span className="card-badge badge-front">
              {card.topic || 'General Topic'}
            </span>
            {total && (
              <span className="paper-tag">
                Card {index + 1}/{total}
              </span>
            )}
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', color: 'var(--text-muted)' }}>
              <HelpCircle size={16} />
              <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>QUESTION</span>
            </div>
            <h3 className="card-question">
              {card.question}
            </h3>
          </div>

          <div className="card-footer">
            <span className="flip-prompt">
              <RotateCw size={14} className="spin-hover" />
              Click card to reveal answer
            </span>
            {showDelete && onDelete && (
              <button 
                type="button"
                className="retro-btn retro-btn-danger retro-btn-sm retro-btn-icon no-flip"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card._id || card.id);
                }}
                title="Delete this card"
                aria-label="Delete card"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="flashcard-back">
          <div className="card-header-bar">
            <span className="card-badge badge-back">
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Answer & Concept
            </span>
            <span className="paper-tag paper-tag-accent">
              {card.topic || 'Card Note'}
            </span>
          </div>

          <div className="card-body">
            <div className="card-answer-box">
              <p className="card-answer">
                {card.answer}
              </p>
            </div>
          </div>

          <div className="card-footer">
            <span className="flip-prompt">
              <RotateCw size={14} />
              Click to flip back
            </span>
            {showDelete && onDelete && (
              <button 
                type="button"
                className="retro-btn retro-btn-danger retro-btn-sm no-flip"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card._id || card.id);
                }}
                title="Delete this card"
              >
                <Trash2 size={13} style={{ marginRight: '4px' }} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
