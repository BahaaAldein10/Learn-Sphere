import {
  Bot,
  ChartPie,
  Compass,
  LayoutDashboard,
  MessageCircle,
  Users,
} from 'lucide-react';

export const StudentSidebarLinks = [
  {
    label: 'Browse',
    route: '/courses',
    Icon: Compass,
  },
  {
    label: 'Dashboard',
    route: '/dashboard',
    Icon: LayoutDashboard,
  },
  {
    label: 'Forum',
    route: '/forum',
    Icon: MessageCircle,
  },
  {
    label: 'Collaboration',
    route: '/collaboration',
    Icon: Users,
  },
  {
    label: 'AI Chatbot',
    route: '/ai_chatbot',
    Icon: Bot,
  },
];

export const TeacherSidebarLinks = [
  {
    label: 'Courses',
    route: '/teacher/courses',
    Icon: Compass,
  },
  {
    label: 'Analytics',
    route: '/teacher/analytics',
    Icon: ChartPie,
  },
  {
    label: 'Forum',
    route: '/teacher/forum',
    Icon: MessageCircle,
  },
  {
    label: 'Collaboration',
    route: '/teacher/collaboration',
    Icon: Users,
  },
  {
    label: 'AI Chatbot',
    route: '/teacher/ai_chatbot',
    Icon: Bot,
  },
];

export const QuestionFilters = [
  { name: 'Most Recent', value: 'most_recent' },
  { name: 'Oldest', value: 'oldest' },
  { name: 'Most Liked', value: 'most_liked' },
  { name: 'Most Viewed', value: 'most_viewed' },
  { name: 'Most Answered', value: 'most_answered' },
];
