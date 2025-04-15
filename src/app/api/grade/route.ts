import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const {
      questions,
      language,
      defaultWeightMCQ,
      defaultWeightTF,
      defaultWeightShort,
      criteria,
    } = await request.json();

    if (
      !Array.isArray(questions) ||
      typeof defaultWeightMCQ !== 'number' ||
      typeof defaultWeightTF !== 'number' ||
      typeof defaultWeightShort !== 'number' ||
      typeof criteria !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Invalid input format.' },
        { status: 400 }
      );
    }

    // Count for normalization
    const countMCQ = questions.filter((q) => q.type === 'MCQ').length;
    const countTF = questions.filter((q) => q.type === 'TRUE_FALSE').length;
    const countShort = questions.filter(
      (q) => q.type === 'SHORT_ANSWER'
    ).length;
    const totalWeight =
      countMCQ * defaultWeightMCQ +
      countTF * defaultWeightTF +
      countShort * defaultWeightShort;

    const responses = await Promise.all(
      questions.map(async (q) => {
        let rawScore = 0;
        let feedback = '';

        if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
          // Direct correctness for MCQ and TRUE_FALSE questions
          rawScore = q.answer === q.correctOptionId ? 1 : 0;
          feedback = rawScore
            ? language === 'Arabic'
              ? 'إجابة صحيحة'
              : 'Correct'
            : language === 'Arabic'
              ? 'إجابة خاطئة'
              : 'Incorrect';
        } else if (
          q.type === 'SHORT_ANSWER' &&
          q.answer &&
          q.answer.trim() !== ''
        ) {
          // Only evaluate SHORT_ANSWER questions that have a non-empty answer

          // Build a comprehensive system prompt that enforces language constraints
          const systemPrompt = `You are a highly precise and unbiased AI assessment tool, designed to evaluate student answers based on predefined criteria. Your primary function is to provide a numerical score and concise feedback, strictly adhering to the specified language constraints. You will receive a question, a student's answer, and the evaluation criteria. Your output must be in JSON format only.

Language: ${language === 'Arabic' ? 'Arabic' : 'English'}
${
  language === 'Arabic'
    ? 'مهم جداً: يجب أن تكون كل ردودك باللغة العربية فقط، ولا تستخدم أي كلمات إنجليزية.'
    : 'IMPORTANT: All your responses must be in English only. Do not use any Arabic words.'
}

Evaluation Instructions:
1. Score: Assign a score between 0 and 1 (inclusive) based on how well the student's answer meets the evaluation criteria.
2. Feedback: Provide a brief explanation for the assigned score. This feedback MUST be in ${language === 'Arabic' ? 'Arabic' : 'English'} only.
3. JSON Format: Your entire response must be a valid JSON object only.

Your response must follow this format exactly:
\`\`\`json
{
  "score": [number between 0 and 1],
  "feedback": "[brief explanation in ${language === 'Arabic' ? 'Arabic' : 'English'} only]"
}
\`\`\``;

          const userPrompt =
            language === 'Arabic'
              ? `السؤال: "${q.question}"
إجابة الطالب: "${q.answer}"
معايير التقييم: ${criteria}

قم بتقييم الإجابة من 0 إلى 1، حيث 0 تعني إجابة غير صحيحة تمامًا و1 تعني إجابة صحيحة تمامًا.
يجب تقديم النتيجة في تنسيق JSON فقط.`
              : `Question: "${q.question}"
Student answer: "${q.answer}"
Evaluation criteria: ${criteria}

Please evaluate the answer on a scale from 0 to 1, where 0 is completely incorrect and 1 is completely correct.
Provide your evaluation as JSON only.`;

          try {
            const ai = await groq.chat.completions.create({
              model: 'gemma2-9b-it',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.2, // Lower temperature for more consistent evaluation
              response_format: { type: 'json_object' }, // Request JSON response if API supports it
            });

            const text = ai.choices[0].message.content as string;

            // More robust JSON extraction - finds JSON between backticks or just standalone JSON
            const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*?\})/;
            const match = text.match(jsonRegex);

            let jsonText = '';
            if (match) {
              // Use the first capture group (between backticks) or the second (standalone JSON)
              jsonText = match[1] || match[2];
            } else {
              // If no JSON format is detected, try using the entire response
              jsonText = text.trim();
            }

            let result;
            try {
              result = jsonText ? JSON.parse(jsonText) : null;
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              // If parsing fails, try to extract score and feedback directly from text
              result = extractScoreAndFeedback(text, language);
            }

            if (result && typeof result.score === 'number') {
              rawScore = Math.max(0, Math.min(1, result.score)); // Ensure score is between 0 and 1
              feedback = result.feedback || '';
            } else {
              console.error('AI did not return valid JSON with score');
              rawScore = 0;
              feedback =
                language === 'Arabic'
                  ? 'تعذر تقييم الإجابة'
                  : 'Could not evaluate answer';
            }
          } catch (e) {
            console.error('AI grading error', e);
            rawScore = 0;
            feedback =
              language === 'Arabic' ? 'فشل التقييم' : 'Evaluation failed';
          }
        } else if (q.type === 'SHORT_ANSWER') {
          // Empty short answer
          rawScore = 0;
          feedback =
            language === 'Arabic' ? 'لم يتم تقديم إجابة' : 'No answer provided';
        }

        // Weighted score
        let weightedScore = 0;
        if (q.type === 'MCQ') weightedScore = rawScore * defaultWeightMCQ;
        else if (q.type === 'TRUE_FALSE')
          weightedScore = rawScore * defaultWeightTF;
        else if (q.type === 'SHORT_ANSWER')
          weightedScore = rawScore * defaultWeightShort;

        return {
          id: q.id,
          type: q.type,
          rawScore,
          weightedScore,
          feedback,
        };
      })
    );

    // Overall normalized score
    const sumWeighted = responses.reduce((sum, r) => sum + r.weightedScore, 0);
    const overallScore = totalWeight > 0 ? sumWeighted / totalWeight : 0;

    return NextResponse.json(
      {
        results: responses,
        overallScore: Math.round(overallScore * 100) / 100,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// Updated helper function to extract score and feedback when JSON parsing fails, with language awareness
function extractScoreAndFeedback(
  text: string,
  language: string
): {
  score: number;
  feedback: string;
} {
  // Try to find score pattern: score: 0.X or score is 0.X
  const scoreMatch = text.match(/score\s*[:is]\s*([0-9]\.[0-9]+|[01])/i);

  // Different feedback patterns based on language
  const feedbackRegex =
    language === 'Arabic'
      ? /feedback\s*[:is]\s*["']?(.*?)["']?(?:\n|$)|ملاحظات\s*[:هي]\s*["']?(.*?)["']?(?:\n|$)/i
      : /feedback\s*[:is]\s*["']?(.*?)["']?(?:\n|$)/i;

  const feedbackMatch = text.match(feedbackRegex);

  return {
    score: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
    feedback: feedbackMatch
      ? (feedbackMatch[1] || feedbackMatch[2] || '').trim()
      : language === 'Arabic'
        ? 'تعذر استخراج الملاحظات'
        : 'Could not parse feedback',
  };
}
