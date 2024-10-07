import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.category.createMany({
      data: [
        { name: 'Programming & Development' },
        { name: 'Design & Creative Arts' },
        { name: 'Business & Entrepreneurship' },
        { name: 'Science & Engineering' },
        { name: 'Mathematics & Statistics' },
        { name: 'Humanities & Social Sciences' },
        { name: 'Language & Communication' },
        { name: 'Health & Wellness' },
        { name: 'Personal Development' },
        { name: 'Arts & Humanities' },
        { name: 'Technology & Tools' },
        { name: 'Law & Policy' },
        { name: 'Marketing & Communication' },
        { name: 'Finance & Accounting' },
        { name: 'Education & Teaching' },
        { name: 'Data Science & AI' },
        { name: 'Leadership & Management' },
        { name: 'Creative Writing & Literature' },
        { name: 'Sports & Fitness' },
        { name: 'Cybersecurity & Information Security' },
      ],
    });

    console.log(
      'Seeding completed successfully: Categories have been added to the database.'
    );
  } catch (error) {
    console.error(
      'Seeding error: Unable to add categories to the database.',
      error
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();
