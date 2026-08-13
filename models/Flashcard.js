import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema(
  {
    // Clerk User ID or session identifier
    userId: {
      type: String,
      required: [true, 'User ID is required to associate cards with a user'],
      trim: true,
      index: true
    },
    // Topic category (e.g., 'JavaScript Closures & Scope', 'Physics', etc.)
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [120, 'Topic cannot exceed 120 characters'],
      index: true
    },
    // Front of card / Question / Prompt
    question: {
      type: String,
      required: [true, 'Question/Prompt is required'],
      trim: true,
      maxlength: [1000, 'Question cannot exceed 1000 characters']
    },
    // Back of card / Answer / Explanation
    answer: {
      type: String,
      required: [true, 'Answer/Explanation is required'],
      trim: true,
      maxlength: [2500, 'Answer cannot exceed 2500 characters']
    },
    // Study difficulty tier
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    // Optional Reference to a parent Deck / Collection
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      default: null,
      index: true
    },
    // Searchable tags / keywords
    tags: {
      type: [String],
      default: []
    },
    // Favorite / Starred bookmark status
    isFavorite: {
      type: Boolean,
      default: false
    },
    // Active recall / Spaced repetition metadata
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastReviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for querying a user's cards by topic quickly
FlashcardSchema.index({ userId: 1, topic: 1 });
FlashcardSchema.index({ userId: 1, createdAt: -1 });

// Full-text search index across questions and answers
FlashcardSchema.index({ question: 'text', answer: 'text', topic: 'text' });

const Flashcard = mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema);

export default Flashcard;
