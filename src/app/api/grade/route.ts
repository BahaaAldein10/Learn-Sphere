import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { questions } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { message: 'Invalid input format' },
        { status: 400 }
      );
    }

    const responses = await Promise.all(
      questions.map(async ({ question, answer, id }) => {
        const prompt = `
        Please grade the following answer on a scale of 0 to 1 and provide a brief explanation.
        Return ONLY a valid JSON object with exactly two keys: "score" (a number between 0 and 1) and "feedback" (a short explanation). 
        Do not include any extra text.

        Question: ${question}
        User Answer: ${answer}
        `;

        try {
          const ai = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gemma2-9b-it',
          });

          const aiResponseText = ai.choices[0].message.content;
          const jsonMatch = aiResponseText?.match(/{[\s\S]*}/);
          const aiResult = jsonMatch
            ? JSON.parse(jsonMatch[0])
            : { score: 0, feedback: 'Parsing failed' };

          return { id, ...aiResult };
        } catch (error) {
          console.error(`Error grading question ID ${id}:`, error);
          return { id, score: 0, feedback: 'AI evaluation failed' };
        }
      })
    );

    const resultsObject = Object.fromEntries(
      responses.map(({ id, score, feedback }) => [id, { score, feedback }])
    );

    return NextResponse.json({ results: resultsObject }, { status: 200 });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
