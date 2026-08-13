import mongoose from 'mongoose';

const DeckSchema = new mongoose.Schema(
  {
    // Clerk User ID owning this deck
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
      index: true
    },
    // Deck title
    title: {
      type: String,
      required: [true, 'Deck title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    // Associated Topic
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      index: true
    },
    // Optional description or summary
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    // Aesthetic color accent for warm paper theme cards
    accentColor: {
      type: String,
      default: '#C9B59C'
    },
    // Cached card count
    cardCount: {
      type: Number,
      default: 0,
      min: 0
    },
    // Last study date
    lastStudiedAt: {
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

// Compound index
DeckSchema.index({ userId: 1, topic: 1 });
DeckSchema.index({ userId: 1, updatedAt: -1 });

// Virtual to populate flashcards belonging to this deck
DeckSchema.virtual('flashcards', {
  ref: 'Flashcard',
  localField: '_id',
  foreignField: 'deckId'
});

const Deck = mongoose.models.Deck || mongoose.model('Deck', DeckSchema);

export default Deck;
