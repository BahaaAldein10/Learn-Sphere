import { getCategoryNameById } from '@/lib/actions/question.actions';
import Link from 'next/link';

interface QuestionCardProps {
  title: string;
  category: string;
  url: string;
  // user: {
  //   name: string;
  //   profilePicture: string;
  //   timeAsked: string;
  // };
  // metrics: {
  //   likes: number;
  //   answers: number;
  //   views: number;
  // };
}

// interface MetricProps {
//   imgUrl: string;
//   alt: string;
//   value: number;
//   title: string;
// }

// const Metric = ({ imgUrl, alt, value, title }: MetricProps) => (
//   <div className="flex items-center gap-2">
//     <Image src={imgUrl} alt={alt} width={20} height={20} />
//     <span className="text-sm text-gray-600">
//       {value} {title}
//     </span>
//   </div>
// );

const QuestionCard = async ({
  title,
  category,
  url,
  // user,
  // metrics,
}: QuestionCardProps) => {
  const categoryName = await getCategoryNameById({ categoryId: category });

  return (
    <div className="w-full rounded-lg bg-gray-100 p-6">
      <Link
        href={`/forum/${url}`}
        className="line-clamp-1 block text-xl font-semibold text-gray-900 transition-colors hover:text-purple-600"
      >
        {title}
      </Link>

      <div className="mt-2 text-sm text-gray-500">{categoryName}</div>

      {/* <div className="mt-6 flex items-center justify-between">
        <Link
          href="#"
          className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
        >
          <Image
            src={user.profilePicture}
            alt={`${user.name} profile picture`}
            width={35}
            height={35}
            className="rounded-full"
          />
          <span className="text-sm">
            <span className="font-medium">{user.name}</span> - asked{' '}
            {user.timeAsked}
          </span>
        </Link>

        <div className="flex gap-4">
          <Metric
            imgUrl="/like-icon.svg"
            alt="likes"
            value={metrics.likes}
            title="Likes"
          />
          <Metric
            imgUrl="/answer-icon.svg"
            alt="answers"
            value={metrics.answers}
            title="Answers"
          />
          <Metric
            imgUrl="/view-icon.svg"
            alt="views"
            value={metrics.views}
            title="Views"
          />
        </div>
      </div> */}
    </div>
  );
};

export default QuestionCard;
