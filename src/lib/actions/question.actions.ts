'use server';

import { Prisma } from '@prisma/client';
import { addHours } from 'date-fns';
import { revalidatePath } from 'next/cache';
import prisma from '../db';
import { handleError } from '../utils';

interface CreateQuestionParams {
  values: {
    clerkId: string;
    title: string;
    description: string;
    categoryId: string;
  };
}

interface UpdateQuestionParams {
  values: {
    clerkId: string;
    title: string;
    description: string;
    categoryId: string;
  };
  questionId: string;
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
      case 'most_liked':
        orderOptions = { likes: { _count: 'desc' } };
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

    const [questions, totalCount] = await prisma.$transaction([
      prisma.question.findMany({
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
          likes: true,
        },
        take: pageSize,
        skip: (pageNumber - 1) * pageSize,
        orderBy: orderOptions,
      }),

      prisma.question.count({
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
      }),
    ]);

    return { questions, totalCount, pageSize };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return { questions: [], totalCount: 0, pageSize: 10 };
  }
}

export async function getQuestionById({ id }: { id: string }) {
  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        answers: true,
        likes: true,
        disLikes: true,
      },
    });

    return question;
  } catch (error) {
    handleError(error);
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
    handleError(error);
  }
}

export async function updateQuestion(params: UpdateQuestionParams) {
  try {
    const { values, questionId } = params;

    const question = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        ...values,
      },
    });

    return question;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });
  } catch (error) {
    handleError(error);
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
    handleError(error);
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
    handleError(error);
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
    handleError(error);
  }
}

interface LikeQuestionParams {
  questionId: string;
  userId: string;
}

export async function likeQuestion(params: LikeQuestionParams) {
  try {
    const { questionId, userId } = params;

    const existingLike = await prisma.like.findUnique({
      where: {
        questionId_clerkId: {
          questionId,
          clerkId: userId,
        },
      },
    });

    const existingDisLike = await prisma.disLike.findUnique({
      where: {
        questionId_clerkId: {
          questionId,
          clerkId: userId,
        },
      },
    });

    if (existingDisLike) {
      await prisma.disLike.delete({
        where: {
          questionId_clerkId: {
            questionId,
            clerkId: userId,
          },
        },
      });
    }

    if (existingLike) {
      await prisma.like.delete({
        where: {
          questionId_clerkId: {
            questionId,
            clerkId: userId,
          },
        },
      });
    } else {
      await prisma.like.create({
        data: {
          questionId,
          clerkId: userId,
        },
      });
    }

    revalidatePath(`/forum/${questionId}`);

    const updatedQuestion = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        likes: true,
      },
    });

    return updatedQuestion;
  } catch (error) {
    handleError(error);
  }
}

export async function disLikeQuestion(params: LikeQuestionParams) {
  try {
    const { questionId, userId } = params;

    const existingDisLike = await prisma.disLike.findUnique({
      where: {
        questionId_clerkId: {
          questionId,
          clerkId: userId,
        },
      },
    });

    const existingLike = await prisma.like.findUnique({
      where: {
        questionId_clerkId: {
          questionId,
          clerkId: userId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          questionId_clerkId: {
            questionId,
            clerkId: userId,
          },
        },
      });
    }

    if (existingDisLike) {
      await prisma.disLike.delete({
        where: {
          questionId_clerkId: {
            questionId,
            clerkId: userId,
          },
        },
      });
    } else {
      await prisma.disLike.create({
        data: {
          questionId,
          clerkId: userId,
        },
      });
    }

    revalidatePath(`/forum/${questionId}`);

    const updatedQuestion = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        likes: true,
      },
    });

    return updatedQuestion;
  } catch (error) {
    handleError(error);
  }
}

interface ViewQuestionParams {
  questionId: string;
  userId: string;
}

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    const { questionId, userId } = params;

    if (!questionId || !userId) {
      throw new Error('questionId and userId are required.');
    }

    // Define the view expiration time in hours
    const viewExpiryHours = 1; // Change this as needed

    // Check for an existing interaction with "view" action
    const existingInteraction = await prisma.interaction.findFirst({
      where: {
        questionId,
        clerkId: userId,
        action: 'view',
      },
      orderBy: {
        createdAt: 'desc', // Get the latest view interaction
      },
    });

    const now = new Date();
    const expirationTime = existingInteraction
      ? addHours(new Date(existingInteraction.createdAt), viewExpiryHours)
      : new Date(0); // If no interaction, set to a past date to allow view count

    // Only increment if there's no recent view within the expiration period
    if (!existingInteraction || now > expirationTime) {
      // Increment views
      await prisma.question.update({
        where: {
          id: questionId,
        },
        data: {
          views: { increment: 1 },
        },
      });

      // Record the new view interaction
      await prisma.interaction.create({
        data: {
          questionId,
          clerkId: userId,
          action: 'view',
        },
      });

      // Revalidate the page path
      revalidatePath(`/forum/${questionId}`);
    }
  } catch (error) {
    handleError(error);
  }
}
