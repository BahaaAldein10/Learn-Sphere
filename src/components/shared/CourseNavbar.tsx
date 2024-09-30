import Navbar from './Navbar';

// interface CourseNavbarProps {
//   course: Course & {
//     chapters: (Chapter & {
//       userProgress: UserProgress[] | null;
//     })[];
//   };
//   progressCount: number;
//   currentProfile?: SafeProfile | null;
// }

export const CourseNavbar = () => {
  return (
    <Navbar />
    // <div className="flex h-full items-center border-b p-4 shadow-sm">
    //   {/* <CourseMobileSidebar course={course} progressCount={progressCount} /> */}
    // </div>
  );
};
