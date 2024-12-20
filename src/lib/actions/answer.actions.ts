'use server';

import { GetAllAnswersParams, UpdateAnswerParams } from '@/types';
import prisma from '../db';
import { parseStringify } from '../utils';

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

export async function getAllAnswers(params: GetAllAnswersParams) {
  try {
    const { questionId, pageNumber = 1, pageSize = 10 } = params;

    const [answers, totalCount] = await prisma.$transaction([
      prisma.answer.findMany({
        where: {
          questionId,
        },
        take: pageSize,
        skip: (pageNumber - 1) * pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      prisma.answer.count({
        where: {
          questionId,
        },
      }),
    ]);

    return { answers, totalCount, pageSize };
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

export async function updateAnswer(params: UpdateAnswerParams) {
  try {
    const { answerId, answerContent } = params;

    const updatedAnswer = await prisma.answer.update({
      where: {
        id: answerId,
      },
      data: {
        content: answerContent,
      },
    });

    return parseStringify(updatedAnswer);
  } catch (error) {
    console.error(error);
  }
}
