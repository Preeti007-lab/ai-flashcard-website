import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import { Flashcard } from '../../models/index.js';
import { generateFlashcards } from '../services/groqService.js';

// In-memory fallback store when MongoDB Atlas connection is unreachable (e.g. IP whitelist)
let inMemoryCards = [];

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Controller: Generate AI Flashcards
 * POST /generate
 */
export async function generate(req, res, next) {
  try {
    const { topic, count = 3 } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A valid non-empty topic string is required.'
      });
    }

    const cardCount = Math.min(Math.max(parseInt(count, 10) || 3, 1), 6);
    const userId = req.authUserId || 'demo-user';

    // Generate flashcards using Groq AI service
    const rawCards = await generateFlashcards(topic.trim(), cardCount);

    // Try connecting to MongoDB Atlas
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('[Flashcard Controller] MongoDB offline/unreachable:', dbErr.message);
    }

    if (isDbConnected()) {
      // Prepare Mongoose documents
      const cardsToInsert = rawCards.map((card, idx) => ({
        userId,
        topic: topic.trim(),
        question: card.question,
        answer: card.answer,
        difficulty: idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard',
        reviewCount: 0
      }));

      const savedCards = await Flashcard.insertMany(cardsToInsert);

      return res.status(201).json({
        success: true,
        topic: topic.trim(),
        count: savedCards.length,
        cards: savedCards
      });
    }

    // Fallback: In-memory store
    const now = new Date().toISOString();
    const fallbackSaved = rawCards.map((card, idx) => {
      const cardObj = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId,
        topic: topic.trim(),
        question: card.question,
        answer: card.answer,
        difficulty: idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard',
        reviewCount: 0,
        createdAt: now,
        updatedAt: now
      };
      inMemoryCards.unshift(cardObj);
      return cardObj;
    });

    return res.status(201).json({
      success: true,
      topic: topic.trim(),
      count: fallbackSaved.length,
      cards: fallbackSaved,
      _storage: 'in-memory (Configure Atlas IP Whitelist for cloud persistence)'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get User Flashcards
 * GET /getcards
 */
export async function getCards(req, res, next) {
  try {
    const userId = req.authUserId || 'demo-user';

    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('[Flashcard Controller] MongoDB offline/unreachable:', dbErr.message);
    }

    if (isDbConnected()) {
      let cards = await Flashcard.find({ userId }).sort({ createdAt: -1 });

      if (cards.length === 0 && userId === 'demo-user') {
        cards = await Flashcard.find({}).sort({ createdAt: -1 }).limit(10);
      }

      return res.status(200).json(cards);
    }

    // Fallback: Return in-memory cards
    const userCards = inMemoryCards.filter(c => c.userId === userId || userId === 'demo-user');
    return res.status(200).json(userCards);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Delete Flashcard
 * DELETE /deletecard/:id
 */
export async function deleteCard(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.authUserId || 'demo-user';

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid flashcard ID parameter format.'
      });
    }

    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('[Flashcard Controller] MongoDB offline/unreachable:', dbErr.message);
    }

    if (isDbConnected()) {
      let deletedCard = await Flashcard.findOneAndDelete({ _id: id, userId });

      if (!deletedCard && userId === 'demo-user') {
        deletedCard = await Flashcard.findByIdAndDelete(id);
      }

      if (!deletedCard) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Flashcard not found or not authorized to delete.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Card successfully deleted',
        deletedId: id
      });
    }

    // Fallback: Remove from inMemoryCards
    const index = inMemoryCards.findIndex(c => c._id === id);
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flashcard not found or not authorized to delete.'
      });
    }

    inMemoryCards.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: 'Card successfully deleted',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
}

export default {
  generate,
  getCards,
  deleteCard
};
