'use client';

import { deleteAnswer, updateAnswer } from '@/lib/actions/answer.actions';
import { formatTimeSince } from '@/lib/utils';
import { Answer, User } from '@prisma/client';
import { Edit, Loader2, Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import { Button } from '../ui/button';
import ConfirmModal from './ConfirmModal';
import Preview from './Preview';

const AnswerCard = ({
  answer,
  isAuthor,
  user,
}: {
  answer: Answer;
  isAuthor: boolean;
  user: User;
}) => {
  const [answerContent, setAnswerContent] = useState(answer.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAnswer = async () => {
    try {
      setIsLoading(true);
      await deleteAnswer({ answerId: answer.id });
      toast.success('Answer deleted successfully');
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAnswer = async () => {
    try {
      setIsLoading(true);
      await updateAnswer({
        answerId: answer.id,
        answerContent,
      });
      setIsEditing(false);
      toast.success('Answer updated successfully');
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div key={answer.id} className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex-between w-full flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={user?.picture}
              alt="profile picture"
              width={28}
              height={28}
              className="select-none rounded-full"
              loading="lazy"
            />
            <div className="text-sm">
              <span className="font-medium text-gray-800">
                {user?.username}
              </span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-500">
                answered {formatTimeSince(answer.createdAt)}
              </span>
            </div>
          </div>

          {isAuthor && (
            <div className="flex gap-2">
              <Button size="icon" disabled={isLoading}>
                {isEditing ? (
                  <X className="size-5" onClick={() => setIsEditing(false)} />
                ) : (
                  <Edit className="size-4" onClick={() => setIsEditing(true)} />
                )}
              </Button>

              <ConfirmModal type="Answer" onDelete={handleDeleteAnswer}>
                <Button variant="destructive" size="icon" disabled={isLoading}>
                  <Trash className="size-4" />
                </Button>
              </ConfirmModal>
            </div>
          )}
        </div>
      </div>

      {/* Answer Content */}
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-4">
            <RichTextEditor
              content={answerContent}
              onChange={(value: string) => setAnswerContent(value)}
            />
            <div className="flex items-center gap-4">
              <Button disabled={isLoading} onClick={handleUpdateAnswer}>
                {isLoading ? (
                  <div className="flex-center gap-2">
                    <Loader2 className="animate-spin" /> Updating...
                  </div>
                ) : (
                  'Update'
                )}
              </Button>

              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Preview value={answer.content} />
          </>
        )}
      </div>
    </div>
  );
};

export default AnswerCard;
