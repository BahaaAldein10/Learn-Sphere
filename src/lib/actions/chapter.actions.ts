'use server';

import prisma from '@/lib/db';
import {
  CreateChapterParams,
  DeleteChapterParams,
  GetChapterParams,
  GetProgressParams,
  PublishChapterParams,
  UpdateChapterFormParams,
  UpdateChapterParams,
  UpdateProgressParams,
} from '@/types';
import { Attachment, Chapter } from '@prisma/client';
import { NextResponse } from 'next/server';
import { handleError } from '../utils';

export async function createChapter(params: CreateChapterParams) {
  try {
    const { title, courseId } = params;

    const lastChapterPosition = await prisma.chapter.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title,
        position: lastChapterPosition ? lastChapterPosition.position + 1 : 1,
        courseId,
      },
    });

    return chapter;
  } catch (error) {
    handleError(error);
  }
}

export async function updateChapter(params: UpdateChapterParams) {
  try {
    const { list } = params;

    for (const item of list) {
      await prisma.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }
  } catch (error) {
    handleError(error);
  }
}

export async function updateChapterForm(params: UpdateChapterFormParams) {
  const { chapterId, courseId, values } = params;

  try {
    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        ...values,
      },
    });

    return chapter;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteChapter(params: DeleteChapterParams) {
  try {
    const { chapterId, courseId } = params;

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    });

    if (!chapter) return new NextResponse('Chapter not found', { status: 404 });

    const deletedChapter = await prisma.chapter.delete({
      where: {
        id: chapterId,
        courseId,
      },
    });

    const publishedChaptersInCourse = await prisma.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return deletedChapter;
  } catch (error) {
    handleError(error);
  }
}

export async function publishChapter(params: PublishChapterParams) {
  try {
    const { courseId, chapterId, isPublished } = params;

    const publishedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: !isPublished,
      },
    });

    const publishedChapters = await prisma.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    });

    if (!publishedChapters.length) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return publishedChapter;
  } catch (error) {
    handleError(error);
  }
}

export async function getProgress(params: GetProgressParams) {
  const { courseId, userId } = params;

  try {
    const publishedChapters = await prisma.chapter.findMany({
      where: { courseId, isPublished: true },
      select: { id: true },
    });

    const chapterIds = publishedChapters.map(
      (chapter: { id: string }) => chapter.id
    );

    const completedCount = await prisma.userProgress.count({
      where: {
        clerkId: userId,
        chapterId: { in: chapterIds },
        isCompleted: true,
      },
    });

    const progressPercentage =
      (completedCount / publishedChapters.length) * 100;

    return progressPercentage;
  } catch (error) {
    handleError(error);
    return 0;
  }
}

export async function getChapter(params: GetChapterParams) {
  try {
    const { chapterId, courseId, userId } = params;

    const purchase = await prisma.purchase.findUnique({
      where: {
        clerkId_courseId: { clerkId: userId, courseId },
      },
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: {
        price: true,
      },
    });

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
      include: {
        userProgress: true,
      },
    });

    if (!course || !chapter) throw new Error('Course or Chapter not found!');

    const videoUrl = chapter.videoUrl;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase) {
      attachments = await prisma.attachment.findMany({
        where: {
          courseId,
        },
      });
    }

    if (chapter.isFree || purchase) {
      nextChapter = await prisma.chapter.findFirst({
        where: {
          courseId,
          isPublished: true,
          position: {
            gt: chapter.position,
          },
        },
        orderBy: {
          position: 'asc',
        },
      });
    }

    const userProgress = await prisma.userProgress.findUnique({
      where: {
        clerkId_chapterId: {
          clerkId: userId,
          chapterId,
        },
      },
    });

    return {
      chapter,
      userProgress,
      nextChapter,
      attachments,
      purchase,
      course,
      videoUrl,
    };
  } catch (error) {
    handleError(error);
    return {
      chapter: null,
      course: null,
      userProgress: null,
      nextChapter: null,
      attachments: [],
      purchase: null,
      videoUrl: null,
    };
  }
}

export async function updateProgress(params: UpdateProgressParams) {
  try {
    const { userId, chapterId, isCompleted } = params;

    const progress = await prisma.userProgress.upsert({
      where: {
        clerkId_chapterId: {
          clerkId: userId,
          chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        clerkId: userId,
        chapterId,
        isCompleted,
      },
    });

    return progress;
  } catch (error) {
    handleError(error);
  }
}
