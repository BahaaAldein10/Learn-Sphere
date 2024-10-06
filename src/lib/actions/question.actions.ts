'use server';

import prisma from '../db';

interface CreateQuestionParams {
  values: {
    clerkId: string;
    title: string;
    description: string;
    categoryId: string;
  };
}

interface GetAllQuestionsParams {
  searchQuery?: string;
}

export async function getAllQuestions(params: GetAllQuestionsParams) {
  try {
    const { searchQuery } = params;

    const questions = await prisma.question.findMany({
      where: {
        ...(searchQuery && {
          OR: [
            {
              title: { contains: searchQuery, mode: 'insensitive' },
            },
            {
              description: { contains: searchQuery, mode: 'insensitive' },
            },
          ],
        }),
      },
      take: 10,
      // skip: (page - 1) * 10,
      orderBy: { createdAt: 'desc' },
    });

    return questions;
  } catch (error) {
    console.log(error);
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    const { values } = params;

    const question = await prisma.question.create({
      data: {
        ...values,
      },
    });

    return question;
  } catch (error) {
    console.log(error);
  }
}

export async function getCategoryIdByName({
  categoryName,
}: {
  categoryName: string;
}) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    });

    return category?.id;
  } catch (error) {
    console.log(error);
  }
}

export async function getCategoryNameById({
  categoryId,
}: {
  categoryId: string;
}) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    return category?.name;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
  }
}
