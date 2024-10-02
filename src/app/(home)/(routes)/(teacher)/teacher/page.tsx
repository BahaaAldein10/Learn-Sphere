import { redirect } from 'next/navigation';

const TeacherPage = () => {
  return redirect('/teacher/courses');
};

export default TeacherPage;
