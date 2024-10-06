/* eslint-disable camelcase */
import prisma from '../db';

interface CreateUserParams {
  userId: string;
  image_url: string;
  username: string;
  email_addresses: {
    email_address: string;
  }[];
}

export async function upsertUser(params: CreateUserParams) {
  try {
    const { userId, image_url, username, email_addresses } = params;

    const user = await prisma.user.upsert({
      create: {
        clerkId: userId,
        picture: image_url,
        username,
        email: email_addresses[0].email_address,
      },
      update: {
        clerkId: userId,
        picture: image_url,
        username,
        email: email_addresses[0].email_address,
      },
      where: {
        clerkId: userId,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: {
        clerkId: userId,
      },
    });
  } catch (error) {
    console.log(error);
  }
}
