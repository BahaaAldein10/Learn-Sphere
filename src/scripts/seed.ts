import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.question.createMany({
      data: [
        // Set 1
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'What are the key elements of a short story?',
          description:
            'A short story typically includes elements such as character, setting, plot, conflict, and theme. Discuss these elements and explain how they work together to create a compelling narrative. (Multiple Choice, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812daf',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'How does symbolism enhance the depth of a literary work?',
          description:
            'Symbolism involves using objects, characters, or events to represent deeper meanings or themes. Explain how authors use symbolism to convey messages and provide examples from well-known works of literature. (Essay, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812daf',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'What is the difference between first-person and third-person narration?',
          description:
            'First-person narration uses "I" or "we," while third-person narration uses "he," "she," or "they." Explain the difference between these two narrative styles and how each influences the reader\'s perspective. (Multiple Choice, Easy)',
          categoryId: '6703e4d0ed61f5a9c9812daf',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'Explain the concept of stream of consciousness in literature.',
          description:
            'Stream of consciousness is a narrative technique that captures the continuous flow of a character’s thoughts and feelings. Discuss how this technique is used in literature and provide examples from famous works. (Essay, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812daf',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'What is the significance of the "hero’s journey" in storytelling?',
          description:
            'The hero’s journey is a common narrative structure in which the protagonist embarks on an adventure, faces challenges, and returns transformed. Explain the key stages of the hero’s journey and its significance in literature and film. (Multiple Choice, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812daf',
        },

        // Set 2
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'What are the components of physical fitness?',
          description:
            'Physical fitness includes components such as cardiovascular endurance, muscular strength, flexibility, and body composition. Explain each component and how they contribute to overall health and fitness. (Multiple Choice, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db0',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'How does regular exercise benefit cardiovascular health?',
          description:
            'Regular exercise strengthens the heart and improves circulation, reducing the risk of heart disease. Discuss the specific benefits of cardiovascular exercise and provide examples of effective activities. (Essay, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db0',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'What is the role of nutrition in athletic performance?',
          description:
            'Nutrition plays a crucial role in providing the energy and nutrients needed for optimal athletic performance. Explain how different macronutrients (carbohydrates, proteins, fats) contribute to energy levels and recovery. (Multiple Choice, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db0',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'Explain the difference between aerobic and anaerobic exercise.',
          description:
            'Aerobic exercise involves sustained activities like running, while anaerobic exercise includes short bursts of high-intensity effort, such as weightlifting. Describe the benefits of each type of exercise and when they are most effective. (Essay, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db0',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'What is the importance of hydration during physical activity?',
          description:
            'Hydration is essential for maintaining performance and preventing dehydration during exercise. Explain the role of water and electrolytes in the body and how to maintain proper hydration levels during physical activity. (Multiple Choice, Easy)',
          categoryId: '6703e4d0ed61f5a9c9812db0',
        },

        // Set 3
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'What are the common types of cybersecurity threats?',
          description:
            'Cybersecurity threats include malware, phishing, ransomware, and social engineering attacks. Explain each type of threat and provide examples of how they can compromise information security. (Multiple Choice, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db1',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title: 'How does encryption protect sensitive information?',
          description:
            'Encryption is the process of encoding data so that only authorized users can access it. Discuss how encryption works and its role in safeguarding sensitive information from unauthorized access. (Essay, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db1',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'What is the difference between a virus and a worm in cybersecurity?',
          description:
            'A virus is malicious software that attaches to a legitimate program, while a worm can replicate itself and spread without user interaction. Explain the key differences between viruses and worms and how they impact computer systems. (Multiple Choice, Easy)',
          categoryId: '6703e4d0ed61f5a9c9812db1',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'Explain the importance of two-factor authentication (2FA) in securing online accounts.',
          description:
            'Two-factor authentication adds an extra layer of security by requiring two forms of identification before granting access to an account. Discuss the benefits of 2FA and how it helps protect against unauthorized access. (Essay, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db1',
        },
        {
          clerkId: 'user_2n3kSC1EOy43I5RaLel67p1lfIC',
          title:
            'What is social engineering in cybersecurity, and how can it be prevented?',
          description:
            'Social engineering involves manipulating individuals into divulging confidential information. Explain how social engineering attacks work and provide strategies for preventing these attacks, such as employee training and awareness. (Multiple Choice, Medium)',
          categoryId: '6703e4d0ed61f5a9c9812db1',
        },
      ],
    });

    console.log('Success');
  } catch (error) {
    console.error('Fail', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
