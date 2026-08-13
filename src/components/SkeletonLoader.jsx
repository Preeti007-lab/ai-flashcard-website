import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.6rem', 
        marginBottom: '1.5rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        <Sparkles size={18} className="spin-hover" />
        <span>Synthesizing concise question-answer pairs with AI...</span>
      </div>

      <div className="cards-grid">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="skeleton-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton-line short" style={{ height: '24px', width: '35%' }} />
              <div className="skeleton-line short" style={{ height: '18px', width: '20%' }} />
            </div>

            <div style={{ margin: '2rem 0' }}>
              <div className="skeleton-line long" style={{ height: '28px' }} />
              <div className="skeleton-line medium" style={{ height: '28px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px dashed rgba(26,26,26,0.15)', paddingTop: '1rem' }}>
              <div className="skeleton-line short" style={{ height: '16px', width: '45%' }} />
              <div className="skeleton-line short" style={{ height: '16px', width: '15%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
