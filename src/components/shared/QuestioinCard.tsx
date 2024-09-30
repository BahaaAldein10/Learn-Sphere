import Image from 'next/image';
import Link from 'next/link';
import Metric from './Metric';

const QuestionCard = () => {
  return (
    <div className="w-full rounded-lg bg-gray-500 p-8">
      <Link href="" className="text-xl font-semibold">
        This is Title for the Question?
      </Link>

      <div className="mt-3">Categories</div>

      <div className="flex-between mt-5">
        <Link href="" className="flex-center gap-2">
          <Image src="" alt="" width={24} height={24} />
          User Name - asked 10 minutes ago
        </Link>

        <div className="flex-center gap-2">
          <Metric
            imgUrl=""
            alt="likes"
            value={10}
            title=" Likes"
            textStyles=""
          />
          <Metric
            imgUrl=""
            alt="message"
            value={10}
            title=" Answers"
            textStyles=""
          />
          <Metric imgUrl="" alt="eye" value={10} title=" Views" textStyles="" />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
