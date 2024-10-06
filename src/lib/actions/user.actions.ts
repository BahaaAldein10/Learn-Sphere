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

export async function deleteUser(id: string | undefined) {
  try {
    await prisma.user.delete({
      where: {
        clerkId: id,
      },
    });
  } catch (error) {
    console.log(error);
  }
}
