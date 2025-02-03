'use server';

/* eslint-disable camelcase */
import { UpdateUserRoleParams } from '@/types';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '../db';
import { liveblocks } from '../liveblocks';
import { getUserColor, parseStringify } from '../utils';

interface CreateUserParams {
  userId: string;
  image_url: string;
  username: string;
  email_addresses: {
    email_address: string;
  }[];
}

interface GetUserParams {
  userId: string;
}

export async function createUser(params: CreateUserParams) {
  try {
    const { userId, image_url, username, email_addresses } = params;

    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        picture: image_url,
        username,
        email: email_addresses[0].email_address,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(params: CreateUserParams) {
  try {
    const { userId, image_url, username, email_addresses } = params;

    const user = await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        clerkId: userId,
        picture: image_url,
        username,
        email: email_addresses[0].email_address,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(id: string | undefined) {
  try {
    await prisma.user.delete({
      where: {
        clerkId: id,
      },
    });

    await prisma.course.deleteMany({
      where: {
        clerkId: id,
      },
    });

    await prisma.question.deleteMany({
      where: {
        clerkId: id,
      },
    });

    await prisma.answer.deleteMany({
      where: {
        clerkId: id,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getUser(params: GetUserParams) {
  try {
    const { userId } = params;

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

export async function getEmailByClerkId({ clerkId }: { clerkId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    return user?.email;
  } catch (error) {
    console.error(error);
  }
}

export async function isTeacher(params: GetUserParams) {
  try {
    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        role: true,
      },
    });

    return user?.role === 'TEACHER';
  } catch (error) {
    console.log(error);
  }
}

export async function isAdmin(params: GetUserParams) {
  try {
    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        role: true,
      },
    });

    return user?.role === 'ADMIN';
  } catch (error) {
    console.error(error);
  }
}

export async function getAdminUsers({ userId }: { userId: string }) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    const adminUsers = users.filter((user) => user.clerkId !== userId);

    return adminUsers;
  } catch (error) {
    console.error(error);
  }
}

export async function updateUserRole(params: UpdateUserRoleParams) {
  try {
    const { clerkId, userRole } = params;

    const user = await prisma.user.update({
      where: {
        clerkId,
      },
      data: {
        role: userRole,
      },
    });

    return user;
  } catch (error) {
    console.error(error);
  }
}
export async function getClerkUsers({ userIds }: { userIds: string[] }) {
  try {
    const { data } = await (
      await clerkClient()
    ).users.getUserList({
      emailAddress: userIds,
    });

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
      color: getUserColor(user.id),
    }));

    const sortedUsers = userIds.map((userId) =>
      users.find((user) => user.email === userId)
    );

    return parseStringify(sortedUsers);
  } catch (error) {
    console.error(error);
  }
}

export async function getDocumentUsers({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );

    if (text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    console.error(error);
  }
}
