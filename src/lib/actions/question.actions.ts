'use server';

import { Prisma } from '@prisma/client';
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
  filterQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export async function getAllQuestions(params: GetAllQuestionsParams) {
  try {
    const { searchQuery, filterQuery, pageNumber = 1, pageSize = 10 } = params;

    let orderOptions: Prisma.QuestionOrderByWithRelationInput;

    switch (filterQuery) {
      case 'most_recent':
        orderOptions = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderOptions = { createdAt: 'asc' };
        break;
      case 'most_voted':
        orderOptions = { upvotes: 'desc' };
        break;
      case 'most_viewed':
        orderOptions = { views: 'desc' };
        break;
      case 'most_answered':
        orderOptions = { answers: { _count: 'desc' } };
        break;
      default:
        orderOptions = { createdAt: 'desc' };
        break;
    }

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
      include: {
        answers: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      orderBy: orderOptions,
    });

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
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
