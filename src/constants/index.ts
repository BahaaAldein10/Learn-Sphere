import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bot,
  ChartPie,
  Clock,
  Compass,
  LayoutDashboard,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
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
];

export const QuestionFilters = [
  { name: 'Most Recent', value: 'most_recent' },
  { name: 'Oldest', value: 'oldest' },
  { name: 'Most Liked', value: 'most_liked' },
  { name: 'Most Viewed', value: 'most_viewed' },
  { name: 'Most Answered', value: 'most_answered' },
];

export const COURSE_SORT_OPTIONS = [
  { label: 'Most Popular', value: 'most-popular', Icon: TrendingUp },
  { label: 'Newest', value: 'newest', Icon: Clock },
  { label: 'Recommended', value: 'recommended', Icon: ThumbsUp },
  {
    label: 'Price: Low to High',
    value: 'price-low-to-high',
    Icon: ArrowDownCircle,
  },
  {
    label: 'Price: High to Low',
    value: 'price-high-to-low',
    Icon: ArrowUpCircle,
  },
];
