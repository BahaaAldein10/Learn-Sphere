'use server';

import {
  CreateQuizParams,
  createQuizQuestionParams,
  deleteQuizParams,
  DeleteQuizQuestionParams,
  getAllQuizQuestionsParams,
  GetQuizParams,
  PublishQuizParams,
  updateQuizConfigurationParams,
  UpdateQuizQuestionParams,
} from '@/types';
import prisma from '../db';

export async function getQuiz(params: GetQuizParams) {
  try {
    const { quizId } = params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return quiz;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createQuiz(params: CreateQuizParams) {
  try {
    const { courseId, title } = params;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        courseId,
      },
    });

    return quiz;
  } catch (error) {
    console.log(error);
  }
}

export async function createQuizQuestion(params: createQuizQuestionParams) {
  try {
    const { questionText, quizId, options, correctAnswer, questionType } =
      params;

    let quizQuestion;

    if (questionType !== 'SHORT_ANSWER') {
      quizQuestion = await prisma.quizQuestion.create({
        data: {
          content: questionText,
          quizId,
          type: questionType,
          options: {
            create: options?.map((option) => ({
              content: option,
              isCorrect: option === correctAnswer,
            })),
          },
        },
      });
    } else {
      quizQuestion = await prisma.quizQuestion.create({
        data: {
          content: questionText,
          quizId,
          type: questionType,
        },
      });
    }

    return quizQuestion;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllQuizQuestions(params: getAllQuizQuestionsParams) {
  try {
    const { quizId } = params;

    const questions = await prisma.quizQuestion.findMany({
      where: {
        quizId,
      },
      include: {
        options: true,
      },
    });

    return questions;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteQuizQuestion(params: DeleteQuizQuestionParams) {
  try {
    const { questionId } = params;

    await prisma.quizQuestion.delete({
      where: {
        id: questionId,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateQuizQuestion(params: UpdateQuizQuestionParams) {
  try {
    const { correctAnswer, options, questionId, questionText, questionType } =
      params;

    let updatedQuestions;

    if (questionType !== 'SHORT_ANSWER') {
      updatedQuestions = await prisma.quizQuestion.update({
        where: {
          id: questionId,
        },
        data: {
          content: questionText,
          type: questionType,
          options: {
            deleteMany: {},
            create: options?.map((option) => ({
              content: option,
              isCorrect: option === correctAnswer,
            })),
          },
        },
      });
    } else {
      updatedQuestions = await prisma.quizQuestion.update({
        where: {
          id: questionId,
        },
        data: {
          content: questionText,
          type: questionType,
        },
      });
    }

    return updatedQuestions;
  } catch (error) {
    console.error(error);
  }
}

export async function updateQuizConfiguration(
  params: updateQuizConfigurationParams
) {
  try {
    const { quizId, quizTitle, language, time } = params;

    const quiz = await prisma.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        title: quizTitle,
        language,
        timeInMinutes: time,
      },
    });

    return quiz;
  } catch (error) {
    console.error(error);
  }
}
export async function publishQuiz(params: PublishQuizParams) {
  try {
    const { quizId, isPublished } = params;

    const quiz = await prisma.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        isPublished: !isPublished,
      },
    });

    return quiz;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteQuiz(params: deleteQuizParams) {
  try {
    const { quizId } = params;

    await prisma.quiz.delete({
      where: {
        id: quizId,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
