import { BookOpenIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CourseCardProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  chapters: number;
  progress: number | null;
  price: number;
}

const CourseCard = ({
  id,
  imageUrl,
  name,
  category,
  chapters,
  progress,
  price,
}: CourseCardProps) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md duration-300 hover:shadow-lg">
      <Link href={`/courses/${id}`} className="block overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${name} course image`}
          width={1000}
          height={1000}
          loading="lazy"
          className="aspect-video select-none object-cover transition-transform duration-300 hover:scale-110"
        />
      </Link>

      <div className="p-4">
        <Link href={`/courses/${id}`}>
          <h2 className="line-clamp-1 text-xl font-semibold text-gray-900 transition-colors duration-200 hover:text-purple-600">
            {name}
          </h2>
        </Link>

        <p className="mt-1 text-sm font-medium text-gray-600">{category}</p>

        <div className="mt-3 flex items-center gap-1 text-gray-700">
          <div className="rounded-full bg-purple-100 p-2">
            <BookOpenIcon color="#6b21a8" size={16} />
          </div>
          <p className="text-sm">{chapters} Chapters</p>
        </div>

        {progress !== null ? (
          <div className="mt-4">
            <div className="relative h-2 w-full rounded-full bg-gray-200">
              <div
                className="absolute h-2 rounded-full bg-purple-700 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
                aria-label={`Course completion: ${progress}%`}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {progress}% Complete
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xl font-bold text-gray-900">${price}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
