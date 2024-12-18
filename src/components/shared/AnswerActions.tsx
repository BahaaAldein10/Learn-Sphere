'use client';

import { deleteAnswer } from '@/lib/actions/answer.actions';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import ConfirmModal from './ConfirmModal';

const AnswerActions = ({ answerId }: { answerId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      setIsLoading(true);
      await deleteAnswer({ answerId });
      toast.success('Answer deleted successfully');
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <ConfirmModal type="Answer" onDelete={() => handleDeleteAnswer(answerId)}>
        <Button variant="destructive" size="icon" disabled={isLoading}>
          <Trash className="size-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default AnswerActions;
