import { Router } from 'express';
import { requireClerkAuth } from '../middleware/auth.js';
import { generate, getCards, deleteCard } from '../controllers/flashcardController.js';

const router = Router();

// POST /generate - Synthesize and store AI flashcards
router.post('/generate', requireClerkAuth, generate);

// GET /getcards - Retrieve flashcards for current authenticated user
router.get('/getcards', requireClerkAuth, getCards);

// DELETE /deletecard/:id - Delete a specific flashcard by ID
router.delete('/deletecard/:id', requireClerkAuth, deleteCard);

export default router;
