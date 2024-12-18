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
    console.log(error);
  }
}

export async function getAllAnswers(questionId: string) {
  try {
    const answers = await prisma.answer.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return answers;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByAnswer({ userId }: { userId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteAnswer({ answerId }: { answerId: string }) {
  try {
    await prisma.answer.delete({
      where: {
        id: answerId,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
