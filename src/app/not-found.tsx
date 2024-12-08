'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      {/* Image Section */}
      <div className="relative w-full max-w-md">
        <Image
          src="/assets/no-courses.jpg"
          alt="Missing or Not Found"
          width={400}
          height={400}
          className="rounded-md"
        />
      </div>

      {/* Text Section */}
      <div className="mt-6">
        <h1 className="text-4xl font-bold text-gray-800">
          404 - Page Not Found
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Oops! It seems like the page you&apos;re looking for doesn&apos;t
          exist. But don’t worry, we’re here to help you find your way!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-x-4">
        <Button
          onClick={() => router.push('/')}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          Go to Homepage
        </Button>
        <Button
          onClick={() => router.back()}
          className="bg-purple-100 text-purple-700 hover:bg-purple-200"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
