/* eslint-disable no-undef */
import { Category, Course, Purchase } from '@prisma/client';
import React from 'react';

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
  searchQuery?: string;
  filterQuery?: string;
  pageNumber?: number;
  pageSize?: number;
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

export interface GetAllAnswersParams {
  questionId: string;
  pageNumber: number;
  pageSize?: number;
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

export type CourseWithProgress = Course & { progress: number | null } & {
  category;
  chapters;
};
export type CoursesResult = {
  coursesWithProgress: CourseWithProgress[];
  pageSize: number;
  totalCount: number;
};

export interface GetQuizParams {
  quizId: string;
}

export interface CreateQuizParams {
  title: string;
  courseId: string;
}

export interface createQuizQuestionParams {
  questionText: string;
  quizId: string;
  options: string[];
  correctAnswer: string;
}

export interface getAllQuizQuestionsParams {
  quizId: string;
}

export interface DeleteQuizQuestionParams {
  questionId: string;
}

export interface UpdateQuizQuestionParams {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface PublishQuizParams {
  quizId: string;
  isPublished: boolean;
}

export interface deleteQuizParams {
  quizId: string;
}

export interface UpdateQuizTitleParams {
  quizId: string;
  quizTitle: string;
}

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type AccessType = ['room:write'] | ['room:read', 'room:presence:write'];

declare type RoomAccesses = Record<string, AccessType>;

declare type UserType = 'creator' | 'editor' | 'viewer';

declare type RoomMetadata = {
  creatorId: string;
  email: string;
  title: string;
};

declare type CreateDocumentParams = {
  userId: string;
  email: string;
};

declare type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  userType?: UserType;
};

declare type ShareDocumentParams = {
  roomId: string;
  email: string;
  userType: UserType;
  updatedBy: User;
};

declare type UserTypeSelectorParams = {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  onClickHandler?: (value: string) => void;
};

declare type ShareDocumentDialogProps = {
  roomId: string;
  collaborators: User[];
  creatorId: string;
  currentUserType: UserType;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type CollaboratorProps = {
  roomId: string;
  email: string;
  creatorId: string;
  collaborator: User;
  user: User;
};

declare type CollaborativeRoomProps = {
  roomId: string;
  roomMetadata: RoomMetadata;
  users: User[];
  currentUserType: UserType;
};

declare type AddDocumentBtnProps = {
  userId: string;
  email: string;
};

declare type DeleteModalProps = { roomId: string };

declare type ThreadWrapperProps = { thread: ThreadData<BaseMetadata> };
