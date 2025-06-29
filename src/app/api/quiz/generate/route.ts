import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize the Groq client with your API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// Define and validate the request payload schema
const requestSchema = z.object({
  numMCQ: z.number().int().min(0).max(50),
  numTF: z.number().int().min(0).max(50),
  numShort: z.number().int().min(0).max(50),
  criteria: z.string().min(5),
  language: z.string().min(1),
});

export async function POST(req: Request) {
  // Step 1: Validate Request Body
  let parsed;
  try {
    const body = await req.json();
    parsed = requestSchema.parse(body);
  } catch (err) {
    console.error('Validation error:', err);
    return NextResponse.json(
      {
        error: 'Invalid request payload',
        details: (err as z.ZodError).errors || err,
      },
      { status: 400 }
    ); 
  }

  const { numMCQ, numTF, numShort, criteria, language } = parsed;

  // Step 2: Check for at least one question
  if (numMCQ + numTF + numShort === 0) {
    return NextResponse.json(
      { error: 'At least one question must be requested' },
      { status: 400 }
    );
  }

  // Step 3: Construct the AI prompt
  const tfTrue = language === 'Arabic' ? 'صح' : 'True';
  const tfFalse = language === 'Arabic' ? 'خطأ' : 'False';

  const prompt = `You are an AI that generates quizzes in ${language}.

Generate a quiz with:
  - ${numMCQ} Multiple Choice Questions
  - ${numTF} True/False Questions
  - ${numShort} Short Answer Questions

Focus on the following criteria: ${criteria}

RESPOND WITH A STRICT JSON OBJECT:

{
  "mcq": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    }
  ],
  "tf": [
    {
      "question": "string",
      "options": ["${tfTrue}", "${tfFalse}"],
      "answer": "${tfTrue}" or "${tfFalse}"
    }
  ],
  "short": [
    {
      "question": "string"
    }
  ]
}

=== FORMATTING RULES ===
1. The JSON must be strictly valid and complete.
2. Each "mcq" item must include:
   - "question": the question text
   - "options": an array of exactly 4 possible answers
   - "answer": one correct answer (must be one of the options)
   Example:
   {
     "question": "What is the capital of France?",
     "options": ["Paris", "Berlin", "Rome", "Madrid"],
     "answer": "Paris"
   }

3. Each "tf" item must include:
   - "question": a statement the student should evaluate
   - "options": ["${tfTrue}", "${tfFalse}"]
   - "answer": one of these two strings (must not be empty or misspelled)
   Example:
   {
     "question": "${language === 'Arabic' ? 'الشمس تشرق من الغرب.' : 'The sun rises in the west.'}",
     "options": ["${tfTrue}", "${tfFalse}"],
     "answer": "${tfFalse}"
   }

4. Each "short" item must include:
   - "question": the question prompt
   Example:
   {
     "question": "Define polymorphism in object-oriented programming."
   }

=== VERY IMPORTANT FOR TRUE/FALSE ===
- For every "tf" item:
  1. Include an "options" array exactly as ["${tfTrue}", "${tfFalse}"].
  2. The "answer" field **must** be one of those two strings.
  3. The "answer" field **must not** be empty or misspelled.
- Do **not** use any other words for true/false, and never leave "answer" blank.

Example of a valid "tf" entry:
{
  "question": "${language === 'Arabic' ? 'الشمس تشرق من الغرب.' : 'The sun rises in the west.'}",
  "options": ["${tfTrue}", "${tfFalse}"],
  "answer": "${tfFalse}"
}

Output **only** the JSON—no extra text, no markdown.`;

  try {
    // Step 4: Call Groq API
    const response = await groq.chat.completions.create({
      model: 'gemma2-9b-it',
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty response from AI model');
    }

    // Step 5: Parse AI's JSON output
    let questionsData;
    try {
      questionsData = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw:', rawContent);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', raw: rawContent },
        { status: 502 }
      );
    }

    // Step 6: Return generated quiz
    return NextResponse.json({ questions: questionsData }, { status: 200 });
  } catch (error) {
    console.error('AI quiz generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during quiz generation' },
      { status: 500 }
    );
  }
}
