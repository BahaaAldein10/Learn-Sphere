/* eslint-disable camelcase */
import prisma from '../db';
import { handleError } from '../utils';

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
    handleError(error);
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
    handleError(error);
  }
}

export async function deleteUser(id: string | undefined) {
  try {
    await prisma.user.delete({
      where: {
        clerkId: id,
      },
    });
  } catch (error) {
    handleError(error);
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
    handleError(error);
  }
}
