'use server';

import {
  CoursesResult,
  CreateAttachmentParams,
  CreateCourseParams,
  DeleteAttachmentParams,
  DeleteCourseParams,
  FindLastCourseParams,
  GetAllCoursesParams,
  GetCourseParams,
  PublishCourseParams,
  PurchaseWithCourse,
  PurchaseWithCourse2,
  RecommendationParams,
  UpdateCourseParams,
} from '@/types';
import { auth } from '@clerk/nextjs/server';
import { Category, Chapter, Course, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import prisma from '../db';
import { getProgress } from './chapter.actions';

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
};

export async function createCourse(params: CreateCourseParams) {
  try {
    const { clerkId, courseName } = params;

    const course = await prisma.course.create({
      data: {
        clerkId,
        name: courseName,
      },
    });

    return course;
  } catch (error) {
    console.log(error);
  }
}

export async function findLastCourse(params: FindLastCourseParams) {
  try {
    const { clerkId } = params;

    const course = await prisma.course.findFirst({
      where: {
        clerkId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return course;
  } catch (error) {
    console.log(error);
  }
}

export async function getCourse(params: GetCourseParams) {
  try {
    const { id, clerkId } = params;

    const course = await prisma.course.findUnique({
      where: {
        id,
        clerkId,
      },
      include: {
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        chapters: {
          orderBy: {
            position: 'asc',
          },
        },
        quiz: true,
      },
    });

    return course;
  } catch (error) {
    console.log(error);
  }
}

export async function getAdminCourse({ id }: { id: string }) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        chapters: {
          orderBy: {
            position: 'asc',
          },
        },
        quiz: true,
      },
    });

    return course;
  } catch (error) {
    console.log(error);
  }
}

export async function getAdminCourses() {
  try {
    const allCourses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const clerkIds = allCourses.map((course) => course.clerkId);

    const users = await prisma.user.findMany({
      where: { clerkId: { in: clerkIds } },
      select: { clerkId: true, email: true },
    });

    const userMap = new Map(users.map((user) => [user.clerkId, user.email]));

    return allCourses.map((course) => ({
      ...course,
      email: userMap.get(course.clerkId) || null, // Attach email
    }));
  } catch (error) {
    console.error(error);
  }
}

export async function updateCourse(params: UpdateCourseParams) {
  try {
    const { id, values, userId } = params;

    const updatedCourse = await prisma.course.update({
      where: {
        id,
        clerkId: userId,
      },
      data: {
        ...values,
      },
    });

    return updatedCourse;
  } catch (error) {
    console.log(error);
  }
}

export async function createAttachment(params: CreateAttachmentParams) {
  try {
    const { courseId, url } = params;

    const attachment = await prisma.attachment.create({
      data: {
        url,
        name: url.split('/').pop() as string,
        courseId,
      },
    });

    return attachment;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteAttachment(params: DeleteAttachmentParams) {
  try {
    const { attachmentId, courseId } = params;

    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const courseOwner = await prisma.course.findUnique({
      where: {
        id: courseId,
        clerkId: userId,
      },
    });

    if (!courseOwner) return new NextResponse('Unauthorized', { status: 401 });

    const attachment = await prisma.attachment.delete({
      where: {
        id: attachmentId,
        courseId,
      },
    });

    return attachment;
  } catch (error) {
    console.log(error);
  }
}

export async function publishCourse(params: PublishCourseParams) {
  try {
    const { courseId, isPublished } = params;

    const publishedCourse = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        isPublished: !isPublished,
      },
    });

    return publishedCourse;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCourse(params: DeleteCourseParams) {
  try {
    const { courseId } = params;

    const course = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return course;
  } catch (error) {
    console.log(error);
  }
}

export async function getDashboardCourses(
  userId: string
): Promise<DashboardCourses> {
  try {
    const purchasedCourses = (await prisma.purchase.findMany({
      where: {
        clerkId: userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    })) as PurchaseWithCourse2[];

    const courses = purchasedCourses.map(
      (purchase) => purchase.course
    ) as CourseWithProgressWithCategory[];

    for (const course of courses) {
      const progress = await getProgress({
        courseId: course.id,
        userId,
      });
      course.progress = progress;
    }

    const completedCourses = courses.filter(
      (course) => course.progress === 100
    );
    const coursesInProgress = courses.filter(
      (course) =>
        (course.progress! === 0 || course.progress! > 0) &&
        course.progress! < 100
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.error(error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
}

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseName: string]: number } = {};

  purchases.forEach((purchase) => {
    const courseName = purchase.course.name;

    if (!grouped[courseName]) {
      grouped[courseName] = 0;
    }

    grouped[courseName] += purchase.course.price!;
  });

  return grouped;
};

export async function getAnalytics(userId: string) {
  try {
    const purchases = (await prisma.purchase.findMany({
      where: {
        course: {
          clerkId: userId,
        },
      },
      include: {
        course: true,
      },
    })) as PurchaseWithCourse[];

    const groupedEarnings = groupByCourse(purchases);
    const data = Object.entries(groupedEarnings).map(([courseName, total]) => ({
      name: courseName,
      total,
    }));

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (error) {
    console.log('[GET_ANALYTICS]', error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
}

export async function getAllCourses(
  params: GetAllCoursesParams
): Promise<CoursesResult> {
  try {
    const {
      userId,
      searchQuery,
      filterQuery,
      pageNumber = 1,
      pageSize = 20,
    } = params;

    let sortOptions: Prisma.CourseOrderByWithRelationInput;

    switch (filterQuery) {
      case 'most-popular':
        sortOptions = { purchases: { _count: 'desc' } };
        break;

      case 'newest':
        sortOptions = {
          createdAt: 'desc',
        };
        break;

      case 'recommended':
        sortOptions = {
          createdAt: 'desc',
        };
        break;

      case 'price-low-to-high':
        sortOptions = {
          price: 'asc',
        };
        break;

      case 'price-high-to-low':
        sortOptions = {
          price: 'desc',
        };
        break;

      default:
        sortOptions = {
          createdAt: 'asc',
        };
        break;
    }

    const [courses, totalCount] = await prisma.$transaction([
      prisma.course.findMany({
        where: {
          isPublished: true,
          ...(searchQuery && {
            OR: [{ name: { contains: searchQuery, mode: 'insensitive' } }],
          }),
        },
        include: {
          category: true,
          chapters: {
            where: {
              isPublished: true,
            },
            select: {
              id: true,
            },
          },
          purchases: {
            where: {
              clerkId: userId,
            },
          },
        },
        orderBy: sortOptions,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),

      prisma.course.count({
        where: {
          isPublished: true,
          ...(searchQuery && {
            OR: [{ name: { contains: searchQuery, mode: 'insensitive' } }],
          }),
        },
      }),
    ]);

    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        if (course.purchases.length === 0) {
          return {
            ...course,
            progress: null,
          };
        }

        const progressPercentage = await getProgress({
          courseId: course.id,
          userId,
        });

        return {
          ...course,
          progress: progressPercentage,
        };
      })
    );

    return { coursesWithProgress, pageSize, totalCount };
  } catch (error) {
    console.log(error);
    return { coursesWithProgress: [], pageSize: 0, totalCount: 0 };
  }
}

export async function getRecommendations(
  params: RecommendationParams
): Promise<CoursesResult> {
  const { userId, searchQuery, pageNumber = 1, pageSize = 20 } = params;

  try {
    // 1. Fetch user behavior data in parallel
    const [
      likes,
      interactions,
      askedQuestions,
      answeredQuestions,
      purchasedCourses,
    ] = await Promise.all([
      prisma.like.findMany({
        where: { clerkId: userId },
        include: { question: { select: { categoryId: true } } },
      }),
      prisma.interaction.findMany({
        where: { clerkId: userId },
        include: { question: { select: { categoryId: true } } },
      }),
      prisma.question.findMany({
        where: { clerkId: userId },
        select: { categoryId: true },
      }),
      prisma.answer.findMany({
        where: { clerkId: userId },
        include: { question: { select: { categoryId: true } } },
      }),
      prisma.purchase.findMany({
        where: { clerkId: userId },
        include: { course: { select: { categoryId: true } } },
      }),
    ]);

    // 2. Define weights for each action type
    const ACTION_WEIGHTS: Record<string, number> = {
      like: 3,
      interaction: 2,
      ask: 1,
      answer: 4,
      purchase: 5,
    };

    // 3. Accumulate category scores based on behaviors
    const categoryScores: Record<string, number> = {};

    likes.forEach((item) => {
      const id = item.question?.categoryId;
      if (id)
        categoryScores[id] = (categoryScores[id] || 0) + ACTION_WEIGHTS.like;
    });
    interactions.forEach((item) => {
      const id = item.question?.categoryId;
      if (id)
        categoryScores[id] =
          (categoryScores[id] || 0) + ACTION_WEIGHTS.interaction;
    });
    askedQuestions.forEach((item) => {
      const id = item.categoryId;
      if (id)
        categoryScores[id] = (categoryScores[id] || 0) + ACTION_WEIGHTS.ask;
    });
    answeredQuestions.forEach((item) => {
      const id = item.question?.categoryId;
      if (id)
        categoryScores[id] = (categoryScores[id] || 0) + ACTION_WEIGHTS.answer;
    });
    purchasedCourses.forEach((item) => {
      const id = item.course?.categoryId;
      if (id)
        categoryScores[id] =
          (categoryScores[id] || 0) + ACTION_WEIGHTS.purchase;
    });

    const allCategoryIds = Object.keys(categoryScores);
    if (allCategoryIds.length === 0) {
      return { coursesWithProgress: [], pageSize: 0, totalCount: 0 };
    }

    // 4. Fetch all matching courses
    const [courses, totalCount] = await prisma.$transaction([
      prisma.course.findMany({
        where: {
          isPublished: true,
          categoryId: { in: allCategoryIds },
          ...(searchQuery && {
            OR: [{ name: { contains: searchQuery, mode: 'insensitive' } }],
          }),
        },
        include: {
          category: true,
          chapters: { where: { isPublished: true }, select: { id: true } },
          purchases: { where: { clerkId: userId } },
        },
      }),
      prisma.course.count({
        where: {
          isPublished: true,
          categoryId: { in: allCategoryIds },
          ...(searchQuery && {
            OR: [{ name: { contains: searchQuery, mode: 'insensitive' } }],
          }),
        },
      }),
    ]);

    // 5. Attach weights and sort courses by descending score, then by recency
    const coursesWithWeights = courses
      .map((course) => ({
        ...course,
        _score: categoryScores[course.categoryId!] || 0,
      }))
      .sort((a, b) => {
        // Primary: weight score
        if (b._score !== a._score) return b._score - a._score;
        // Secondary: newer courses first
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    // 6. Paginate in-memory
    const skip = (pageNumber - 1) * pageSize;
    const paginatedCourses = coursesWithWeights.slice(skip, skip + pageSize);

    // 7. Compute progress for each paginated course
    const coursesWithProgress = await Promise.all(
      paginatedCourses.map(async (course) => {
        if (course.purchases.length === 0) {
          return { ...course, progress: null };
        }
        const progress = await getProgress({ courseId: course.id, userId });
        return { ...course, progress };
      })
    );

    return { coursesWithProgress, pageSize, totalCount };
  } catch (error) {
    console.error('❌ Failed to get recommendations:', error);
    return { coursesWithProgress: [], pageSize: 0, totalCount: 0 };
  }
}
