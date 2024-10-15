'use client';

import {
  disLikeQuestion,
  likeQuestion,
  viewQuestion,
} from '@/lib/actions/question.actions';
import { useAuth } from '@clerk/nextjs';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const Likes = ({
  questionId,
  hasLiked,
  hasDisliked,
}: {
  questionId: string;
  hasLiked: boolean;
  hasDisliked: boolean;
}) => {
  const [liked, setLiked] = useState(hasLiked);
  const [disliked, setDisliked] = useState(hasDisliked);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return redirect('/');
    setLiked(hasLiked);
    setDisliked(hasDisliked);

    viewQuestion({
      questionId,
      userId,
    });
  }, [hasLiked, questionId, hasDisliked, userId]);

  const handleLike = async () => {
    if (!userId) return;

    setLiked(!hasLiked);
    setDisliked(false);

    await likeQuestion({
      questionId,
      userId,
    });
  };

  const handleDislike = async () => {
    if (!userId) return;

    setDisliked(!disliked);
    setLiked(false);

    await disLikeQuestion({
      questionId,
      userId,
    });
  };

  const likeButtonClasses = `
    flex items-center rounded-lg bg-transparent shadow-none transition-colors duration-200 hover:bg-purple-200
    ${liked ? 'bg-purple-100 text-purple-600' : 'text-gray-700'}
  `;

  const dislikeButtonClasses = `
    flex items-center rounded-lg bg-transparent shadow-none transition-colors duration-200 hover:bg-red-200
    ${disliked ? 'bg-red-100 text-red-600' : 'text-gray-700'}
  `;

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label="Like this question"
        className={likeButtonClasses}
        onClick={handleLike}
        disabled={!userId}
      >
        <ThumbsUp className="size-5" />
        <span className="ml-2 text-base font-medium">Like</span>
      </Button>

      <Button
        aria-label="Dislike this question"
        className={dislikeButtonClasses}
        onClick={handleDislike}
        disabled={!userId}
      >
        <ThumbsDown className="size-5" />
        <span className="ml-2 text-base font-medium">Dislike</span>
      </Button>
    </div>
  );
};

export default Likes;
