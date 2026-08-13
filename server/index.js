import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './db.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
  })
);

app.use(express.json());

// Mount Clerk middleware if keys are configured
if (process.env.CLERK_SECRET_KEY || process.env.CLERK_PUBLISHABLE_KEY) {
  try {
    app.use(clerkMiddleware());
    console.log('[Server] Clerk authentication middleware initialized');
  } catch (clerkErr) {
    console.warn('[Server] Clerk middleware initialization warning:', clerkErr.message);
  }
}

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Flashcard API Routes (serving /generate, /getcards, /deletecard/:id)
app.use('/', flashcardRoutes);
app.use('/api', flashcardRoutes); // Also support /api/* prefix

// Centralized error handling
app.use(errorHandler);

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`[Server] Flashcard API backend running on http://localhost:${PORT}`);
});

// Connect to MongoDB Atlas
connectDB()
  .then(() => {
    console.log('[Server] Database ready.');
  })
  .catch((err) => {
    console.error('[Server] Database connection error:', err.message);
  });

export { app, server };
export default app;
