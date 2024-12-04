import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { conversationHistory } = body;
    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json(
        {
          error: 'Conversation history is required to process the request.',
        },
        {
          status: 400,
        }
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: 'llama3-8b-8192',
    });

    const responseContent = chatCompletion.choices?.[0]?.message?.content;
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response was received from the language model.' },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({ response: responseContent }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
