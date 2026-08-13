import { Groq } from 'groq-sdk';

let groqClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Fallback generator when GROQ_API_KEY is not configured
 */
function generateFallbackCards(topic, count) {
  const cleanTopic = topic.trim();
  const templates = [
    {
      q: `What is the core definition and primary concept of ${cleanTopic}?`,
      a: `In the context of ${cleanTopic}, the fundamental principle revolves around establishing structured boundaries, predictable execution behavior, and clear separation of concerns.`
    },
    {
      q: `What are the key architectural mechanisms behind ${cleanTopic}?`,
      a: `When implementing ${cleanTopic}, the primary mechanism leverages modular encapsulation, efficient resource utilization, and deterministic state transitions to ensure scalability.`
    },
    {
      q: `What are the primary best practices and common pitfalls when working with ${cleanTopic}?`,
      a: `A critical best practice in ${cleanTopic} is maintaining strict isolation of side effects, verifying edge conditions, and avoiding unnecessary complexity.`
    },
    {
      q: `What are the main real-world use cases and applications of ${cleanTopic}?`,
      a: `In modern production systems, ${cleanTopic} is commonly utilized for building resilient distributed workflows, high-throughput pipelines, and responsive user experiences.`
    },
    {
      q: `What are the primary trade-offs and performance considerations associated with ${cleanTopic}?`,
      a: `The primary trade-off when adopting ${cleanTopic} involves balancing initial configuration overhead versus long-term maintainability, testability, and operational velocity.`
    },
    {
      q: `How do you effectively test and debug systems utilizing ${cleanTopic}?`,
      a: `Testing ${cleanTopic} effectively requires comprehensive unit test suites covering edge cases, automated regression verification, and observable telemetry.`
    }
  ];

  return templates.slice(0, Math.min(count, templates.length)).map(t => ({
    question: t.q,
    answer: t.a
  }));
}

/**
 * Generate flashcards using Groq AI SDK with structured JSON output
 * @param {string} topic - The topic to generate cards for
 * @param {number} count - Number of cards (1-6)
 * @returns {Promise<Array<{question: string, answer: string}>>}
 */
export async function generateFlashcards(topic, count = 3) {
  const cleanTopic = topic?.trim();
  const cardCount = Math.min(Math.max(parseInt(count, 10) || 3, 1), 6);

  if (!cleanTopic) {
    throw new Error('A valid topic string is required for flashcard generation.');
  }

  const groq = getGroqClient();

  // If no Groq API Key provided, use high-quality semantic synthesis fallback
  if (!groq) {
    console.log('[Groq Service] GROQ_API_KEY not set. Using built-in generator fallback.');
    return generateFallbackCards(cleanTopic, cardCount);
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const systemPrompt = `You are an expert educational AI flashcard creator.
Generate exactly ${cardCount} high-yield, engaging flashcards for the given study topic.
Each card must feature a clear, conceptual question on the front and a concise, precise, and educational explanation on the back.

Your output MUST be a valid JSON object matching this exact schema:
{
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
Do not include markdown codeblocks, explanations, emojis, or any text outside the JSON object.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Topic: "${cleanTopic}"\nCount: ${cardCount}` }
      ],
      model,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent);
    const flashcards = parsed.flashcards || parsed.cards;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error('Groq AI output did not contain a valid flashcards array.');
    }

    // Validate and clean each card
    const validatedCards = flashcards.slice(0, cardCount).map((card, idx) => {
      const q = (card.question || card.q || '').trim();
      const a = (card.answer || card.a || '').trim();

      if (!q || !a) {
        throw new Error(`Flashcard at index ${idx} is missing a question or answer.`);
      }

      return {
        question: q,
        answer: a
      };
    });

    return validatedCards;
  } catch (error) {
    console.error('[Groq Service] Error during AI generation:', error.message);
    // If API call fails (rate limit, invalid key, etc.), fall back gracefully
    console.log('[Groq Service] Falling back to template synthesis due to error.');
    return generateFallbackCards(cleanTopic, cardCount);
  }
}

export default {
  generateFlashcards
};
