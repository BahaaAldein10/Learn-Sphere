import Chatbot from '@/components/shared/Chatbot';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chatbot | LearnSphere',
  description:
    'Interact with the AI chatbot at LearnSphere to get instant tutoring assistance and personalized learning recommendations.',
  keywords: 'AI chatbot, learning assistant, AI tutor, personalized learning',
};

const AIChatbot = () => {
  return <Chatbot />;
};

export default AIChatbot;
