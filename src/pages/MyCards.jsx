import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Folder, FolderOpen, BookOpen, Trash2, Search, Sparkles, ChevronDown, ChevronUp, Layers, RefreshCw } from 'lucide-react';
import Flashcard from '../components/Flashcard';
import { getSavedCards, deleteCard, SAMPLE_DEMO_CARDS } from '../services/api';

export default function MyCards({ onNavigate, showToast, hasClerkKey }) {
  const { getToken, isSignedIn } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openFolders, setOpenFolders] = useState({});

  // Load saved cards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await getSavedCards(hasClerkKey && isSignedIn ? getToken : null);
      const cardsList = Array.isArray(data) ? data : (data.cards || []);
      setCards(cardsList);

      // Auto-open first folder if exists
      if (cardsList.length > 0) {
        const firstTopic = cardsList[0].topic || 'General';
        setOpenFolders({ [firstTopic]: true });
      }
    } catch (err) {
      console.warn('Could not fetch saved cards from server, loading demo cards:', err.message);
      // Fallback to sample demo cards for smooth local exploration
      setCards(SAMPLE_DEMO_CARDS);
      setOpenFolders({ 'Cognitive Science': true, 'Computer Science': true, 'Physics': true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [isSignedIn]);

  // Handle card deletion
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      await deleteCard(cardId, hasClerkKey && isSignedIn ? getToken : null);
      setCards((prev) => prev.filter((c) => (c._id || c.id) !== cardId));
      showToast?.('Card deleted from library', 'success');
    } catch (err) {
      console.warn('API delete error, removing locally:', err.message);
      // Delete locally
      setCards((prev) => prev.filter((c) => (c._id || c.id) !== cardId));
      showToast?.('Card removed', 'success');
    }
  };

  // Group cards by Topic
  const groupedCards = cards.reduce((acc, card) => {
    const topic = card.topic?.trim() || 'General Deck';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(card);
    return acc;
  }, {});

  // Filter groups by search term
  const filteredTopics = Object.keys(groupedCards).filter((topic) =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFolder = (topic) => {
    setOpenFolders((prev) => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  return (
    <div>
      {/* Header bar */}
      <div className="paper-panel" style={{ marginBottom: '2rem' }}>
        <div className="paper-panel-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={22} color="#1a1a1a" />
              My Flashcard Library
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Your saved decks organized in retro manila folders by topic.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="retro-btn retro-btn-sm"
              onClick={fetchCards}
              disabled={loading}
              title="Refresh library"
            >
              <RefreshCw size={14} className={loading ? 'spin-hover' : ''} />
              Refresh
            </button>
            <button 
              type="button" 
              className="retro-btn retro-btn-sm retro-btn-primary"
              onClick={() => onNavigate('generate')}
            >
              <Sparkles size={14} />
              Create New Deck
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="retro-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search saved decks and topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', fontFamily: 'var(--font-mono)' }}>
          <p>Retrieving your card catalog from the cloud...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && cards.length === 0 && (
        <div className="paper-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--accent)', border: 'var(--border)', boxShadow: 'var(--shadow)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Folder size={28} color="#1a1a1a" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Library is Empty</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            You haven't generated any flashcards yet. Jump to the studio to synthesize your first study deck!
          </p>
          <button
            type="button"
            className="retro-btn retro-btn-primary"
            onClick={() => onNavigate('generate')}
          >
            <Sparkles size={16} />
            Generate First Deck
          </button>
        </div>
      )}

      {/* Topic Folders List */}
      {!loading && filteredTopics.length > 0 && (
        <div>
          {filteredTopics.map((topic) => {
            const topicCards = groupedCards[topic];
            const isOpen = !!openFolders[topic];

            return (
              <div key={topic} className={`folder-accordion ${isOpen ? 'open' : ''}`}>
                <div 
                  className="folder-tab-header"
                  onClick={() => toggleFolder(topic)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggleFolder(topic); }}
                  aria-expanded={isOpen}
                >
                  <div className="folder-title-area">
                    <div className="folder-icon-box">
                      {isOpen ? <FolderOpen size={18} color="#1a1a1a" /> : <Folder size={18} color="#1a1a1a" />}
                    </div>
                    <div>
                      <h4 className="folder-title">{topic}</h4>
                      <span className="folder-meta">
                        {topicCards.length} {topicCards.length === 1 ? 'card' : 'cards'} in deck
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="paper-tag">
                      {isOpen ? 'Fold' : 'Expand'}
                    </span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isOpen && (
                  <div className="folder-content">
                    <div className="cards-grid">
                      {topicCards.map((card, idx) => (
                        <Flashcard
                          key={card._id || card.id || idx}
                          card={card}
                          showDelete={true}
                          onDelete={handleDeleteCard}
                          index={idx}
                          total={topicCards.length}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No Search Match */}
      {!loading && cards.length > 0 && filteredTopics.length === 0 && (
        <div className="paper-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="mono" style={{ color: 'var(--text-muted)' }}>
            No decks matched "{searchTerm}".
          </p>
        </div>
      )}
    </div>
  );
}
