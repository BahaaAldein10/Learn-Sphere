import { CourseWithProgressWithCategory } from '@/types';
import CourseCard from './CourseCard';

interface CoursesListProps {
  items: CourseWithProgressWithCategory[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            name={item.name}
            imageUrl={item.imageUrl!}
            chapters={item.chapters.length}
            price={item.price!}
            progress={item.progress}
            category={item?.category?.name as string}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          No courses found
        </div>
      )}
    </div>
  );
};
