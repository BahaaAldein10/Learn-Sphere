'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

const Likes = () => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = async () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = async () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
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
      >
        <ThumbsUp className="size-6" />
        <span className="ml-2 text-lg font-medium">Like</span>
      </Button>

      <Button
        aria-label="Dislike this question"
        className={dislikeButtonClasses}
        onClick={handleDislike}
      >
        <ThumbsDown className="size-6" />
        <span className="ml-2 text-lg font-medium">Dislike</span>
      </Button>
    </div>
  );
};

export default Likes;
