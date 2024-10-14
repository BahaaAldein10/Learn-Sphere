'use server';

import prisma from '../db';

interface CreateAnswerParams {
  userId: string;
  questionId: string;
  content: string;
}

export async function createAnswer(params: CreateAnswerParams) {
  try {
    const { userId, questionId, content } = params;

    const answer = await prisma.answer.create({
      data: {
        clerkId: userId,
        questionId,
        content,
      },
    });

    return answer;
  } catch (error) {
    handleError(error);
  }
}

export async function getAllAnswers(questionId: string) {
  try {
    const answers = await prisma.answer.findMany({
      where: {
        questionId,
      },
    });

    return answers;
  } catch (error) {
    handleError(error);
  }
}
