import { Category, Course, Purchase } from '@prisma/client';

export interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

export interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export interface ParamsProps {
  params: { id: string };
}

export interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

export interface URLProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export interface CreateCourseParams {
  clerkId: string;
  courseName: string;
}

export interface GetAllCoursesParams {
  userId: string;
}

export interface FindLastCourseParams {
  clerkId: string;
}

export interface GetCourseParams {
  id: string;
  clerkId: string;
}

export interface CourseUpdateValues {
  name?: string;
  description?: string;
  isFree?: boolean;
  videoUrl?: string;
  courseId?: string;
  chapterId?: string;
  categoryId?: string;
  imageUrl?: string;
  price?: number | null;
}

export interface UpdateCourseParams {
  id: string;
  userId: string;
  values: CourseUpdateValues;
}

export interface CreateAttachmentParams {
  courseId: string;
  url: string;
}

export interface DeleteAttachmentParams {
  attachmentId: string;
  courseId: string;
}

export interface CreateChapterParams {
  title: string;
  courseId: string;
}

export interface UpdateChapterParams {
  list: {
    id: string;
    position: number;
  }[];
}

export interface ChapterUpdateValues {
  title?: string;
  description?: string;
  isFree?: boolean;
  videoUrl?: string;
  courseId?: string;
  chapterId?: string;
}

export interface UpdateChapterFormParams {
  chapterId: string;
  courseId: string;
  values: ChapterUpdateValues;
  videoUrl?: string;
}

export interface DeleteChapterParams {
  chapterId: string;
  courseId: string;
}

export interface DeleteCourseParams {
  courseId: string;
}

export interface PublishChapterParams {
  chapterId: string;
  courseId: string;
  isPublished: boolean;
}

export interface PublishCourseParams {
  courseId: string;
  isPublished: boolean;
}

export interface GetProgressParams {
  courseId: string;
  userId: string;
}

export interface GetChapterParams {
  chapterId: string;
  courseId: string;
  userId: string;
}

export interface UpdateProgressParams {
  chapterId: string;
  userId: string;
  isCompleted: boolean;
}

export type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

export type PurchaseWithCourse = Purchase & {
  course: Course;
};

export type PurchaseWithCourse2 = {
  course: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
    chapters: {
      id: string;
      title: string;
      isPublished: boolean;
    }[];
  };
};
