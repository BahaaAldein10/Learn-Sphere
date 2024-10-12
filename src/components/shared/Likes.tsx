'use client';

import { disLikeQuestion, likeQuestion } from '@/lib/actions/question.actions';
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
  }, [hasLiked, hasDisliked, userId]);

  const handleLike = async () => {
    if (!userId) return;

    const updatedQuestion = await likeQuestion({
      questionId,
      userId,
    });

    if (updatedQuestion) {
      setLiked(true);
      setDisliked(false);
    }
  };

  const handleDislike = async () => {
    if (!userId) return;

    const updatedQuestion = await disLikeQuestion({
      questionId,
      userId,
    });

    if (updatedQuestion) {
      setDisliked(!disliked);
      setLiked(false);
    }
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
        <ThumbsUp className="size-6" />
        <span className="ml-2 text-lg font-medium">Like</span>
      </Button>

      <Button
        aria-label="Dislike this question"
        className={dislikeButtonClasses}
        onClick={handleDislike}
        disabled={!userId}
      >
        <ThumbsDown className="size-6" />
        <span className="ml-2 text-lg font-medium">Dislike</span>
      </Button>
    </div>
  );
};

export default Likes;
