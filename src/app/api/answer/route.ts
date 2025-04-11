import Groq from 'groq-sdk';
import { marked } from 'marked';
import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return new NextResponse('Question is required to process the request.', {
        status: 400,
      });
    }

    // Prompt with markdown formatting instructions
    const formattedPrompt = `
      Answer the following question in a structured markdown format, using clear headings, bullet points, and tables where appropriate.

      Question: ${question}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: formattedPrompt }],
      model: 'llama3-8b-8192',
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      return new NextResponse(
        'No response was received from the language model.',
        { status: 500 }
      );
    }

    // Convert markdown to HTML
    const rawHtml = marked.parse(responseContent);

    // Sanitize the HTML to prevent XSS
    const safeHtml = sanitizeHtml(rawHtml as string, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'h1',
        'h2',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'name', 'target'],
      },
    });

    return NextResponse.json({ response: safeHtml }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      'An unexpected error occurred. Please try again later.',
      { status: 500 }
    );
  }
}
