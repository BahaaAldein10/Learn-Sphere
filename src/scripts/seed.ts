import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const firstChapters = await prisma.chapter.updateMany({
      where: {
        position: 1,
      },
      data: {
        isFree: true,
      },
    });

    console.log('Success');
    return firstChapters;
  } catch (error) {
    console.error('Fail', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
