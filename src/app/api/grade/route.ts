import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { questions, language } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { message: 'Invalid input format' },
        { status: 400 }
      );
    }

    const responses = await Promise.all(
      questions.map(
        async ({
          question,
          answer,
          id,
        }: {
          question: string;
          answer: string;
          id: string;
        }) => {
          const prompt =
            language === 'Arabic'
              ? `
يرجى تقييم الإجابة التالية عن السؤال المعروض وتحديد درجة من 0 إلى 1، حيث تُشير الدرجة 0 إلى إجابة خاطئة أو غير كافية تمامًا، وتُشير الدرجة 1 إلى إجابة صحيحة بشكل كامل.
بالإضافة إلى ذلك، قدم شرحًا موجزًا (بجملة واحدة كحد أقصى) يوضح سبب هذا التقييم.
يجب أن يكون ردك عبارة عن كائن JSON صالح يحتوي فقط على مفتاحين: "score" (رقم بين 0 و 1) و"feedback" (شرح موجز باللغة العربية).
لا تقم بإضافة أي نصوص أو تعليقات إضافية أو خلط اللغة.
تفاصيل السؤال:
السؤال: ${question}
إجابة المستخدم: ${answer}
`
              : `
Please evaluate the following answer by assigning a score from 0 to 1, where 0 indicates a completely incorrect or insufficient answer, and 1 indicates a fully correct answer.
Additionally, provide a concise explanation (up to one sentence) that justifies the score.
Your response MUST be in valid JSON format containing exactly two keys: "score" (a number between 0 and 1) and "feedback" (a brief explanation).
Do NOT include any extra text or commentary.
Here are the details:
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
              : {
                  score: 0,
                  feedback:
                    language === 'Arabic' ? 'فشل تحليل الرد' : 'Parsing failed',
                };

            return { id, ...aiResult };
          } catch (error) {
            console.error(`Error grading question ID ${id}:`, error);
            return {
              id,
              score: 0,
              feedback:
                language === 'Arabic'
                  ? 'فشل تقييم الذكاء الاصطناعي'
                  : 'AI evaluation failed',
            };
          }
        }
      )
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
