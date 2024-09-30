'use client';

import { Button } from '@/components/ui/button';
import { Checkout } from '@/lib/actions/checkout.actions';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { userId } = useAuth();
  if (!userId) return redirect('/');

  const onClick = async () => {
    try {
      setIsLoading(true);

      const response = await Checkout({
        courseId,
        userId,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      router.push(response.sessionUrl as string);
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      Enroll for {formatPrice(price)}
    </Button>
  );
};
