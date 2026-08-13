Act as a Senior Backend Engineer. Implement a secure, modular Express.js REST API using native Node.js ES Modules (ESM) to support an AI-powered Flashcards Generator.

## Dependencies & Core Environment
- Packages: `express`, `cors`, `mongoose`, `groq-sdk`, `@clerk/express`, `dotenv`
- Dev Dependencies: `nodemon`
- Configure `package.json` with `"type": "module"`.
- Environment Variables required (do not hardcode, load via `import 'dotenv/config'`):
  - `PORT` (default 5000)
  - `MONGODB_URI` (direct replica set hosts or standard database string)
  - `GROQ_API_KEY` (completions credential)
  - `GROQ_MODEL` (default `llama-3.3-70b-versatile`)
  - `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

---

## File Structure & Implementations

### 1. `src/models/Flashcard.js`
Create the Mongoose schema with fields `userId`, `topic`, `question`, and `answer`. Add timestamps and index `userId` for quick retrieval:
```javascript
import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true, trim: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true }
}, { timestamps: true });

export default mongoose.model('Flashcard', flashcardSchema);
```

### 2. `src/middleware/auth.js`
Auth middleware. Uses Clerk's official `@clerk/express` helper `getAuth(req)` to resolve the authenticated user, attaching `userId` as `req.authUserId`. Includes a bypass if `req.authUserId` is already set (for unit-testing):
```javascript
import { getAuth } from '@clerk/express';

export function requireClerkAuth(req, res, next) {
  try {
    if (req.authUserId) return next();
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'A valid Clerk authentication session token is required.'
      });
    }
    req.authUserId = auth.userId;
    next();
  } catch (err) {
    console.error('Clerk Auth Verification Error:', err);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Failed to verify Clerk authentication token.'
    });
  }
}
```

### 3. `src/services/groqService.js`
Invocations for Groq SDK. Uses JSON response format with a strict system prompt to generate exactly `count` cards. Loops to validate and trim returned strings, throwing errors for empty results or mismatched card counts:
```javascript
import { Groq } from 'groq-sdk';

let groqClient = null;
function getGroq() {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing.');
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

export async function generateFlashcards(topic, count) {
  const groq = getGroq();
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const systemPrompt = `Generate exactly ${count} flashcards for the topic.
Your output must be a valid JSON object:
{ "flashcards": [ { "question": "string", "answer": "string" } ] }
Do not include any extra text outside the JSON object. Do not use emojis.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Topic: "${topic}"` }
    ],
    model,
    response_format: { type: "json_object" }
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
  const flashcards = parsed.flashcards;

  if (!Array.isArray(flashcards) || flashcards.length !== count) {
    throw new Error('AI output is invalid or size mismatched.');
  }

  return flashcards.map(card => {
    if (!card.question?.trim() || !card.answer?.trim()) {
      throw new Error('AI generated card has empty fields.');
    }
    return { question: card.question.trim(), answer: card.answer.trim() };
  });
}
```

### 4. `src/controllers/flashcardController.js`
Define route controller actions for:
- `generate`: Validates body properties `topic` (must be non-empty string) and `count` (must be integer between 1 and 6). Calls the Groq service, assigns `userId: req.authUserId`, and persists them in MongoDB. Returns `201 Created`.
- `getCards`: Queries `Flashcard` schema by `{ userId: req.authUserId }`, sorting by newest (`createdAt: -1`). Returns `200 OK`.
- `deleteCard`: Validates that `req.params.id` is a valid Mongoose ObjectId. Runs `findOneAndDelete` matching `{ _id: id, userId: req.authUserId }` to prevent cross-account deletions. Returns `200 OK` or `404 Not Found`.

### 5. `src/index.js`
Main Express entrypoint:
- Boot up MongoDB connection via Mongoose.
- Configure CORS to dynamically reflect the client's origin (`origin: true`) and enable credentials.
- Parse JSON bodies (`express.json()`).
- Mount global Clerk session middleware `clerkMiddleware()`.
- Register routes:
  - `POST /generate` -> protected by `requireClerkAuth`
  - `GET /getcards` -> protected by `requireClerkAuth`
  - `DELETE /deletecard/:id` -> protected by `requireClerkAuth`
- Configure a centralized Express error handler sending standard JSON objects.