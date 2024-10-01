'use server';

import {
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
  UpdateCourseParams,
} from '@/types';
import { auth } from '@clerk/nextjs/server';
import Mux from '@mux/mux-node';
import { Category, Chapter, Course, Purchase } from '@prisma/client';
import { NextResponse } from 'next/server';
import prisma from '../db';
import { getProgress } from './chapter.actions';

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_SECRET_KEY,
});

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type CourseWithProgress = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  isPublished: boolean;
  clerkId: string;
  imageUrl: string | null;
  price: number | null;
  categoryId: string | null;
  category: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  purchases: Purchase[];
  chapters: { id: string }[];
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
      },
    });

    return course;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllCourses(params: GetAllCoursesParams) {
  try {
    const { userId, searchQuery } = params;

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
          ],
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    const coursesWithProgress = await Promise.all(
      courses.map(async (course: CourseWithProgress) => {
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

    return coursesWithProgress;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
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

    const { userId } = auth();
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

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) return new NextResponse('course not found', { status: 404 });

    for (const chapter of course?.chapters) {
      if (chapter.muxData?.assetId) {
        await video.assets.delete(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return deletedCourse;
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
