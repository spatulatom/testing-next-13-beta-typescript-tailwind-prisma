'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { toggleHeart } from '@/app/hearts/actions';

type HeartButtonProps = {
  postId: string;
  initialCount: number;
  initialHearted: boolean;
  canHeart: boolean;
};

export default function HeartButton({
  postId,
  initialCount,
  initialHearted,
  canHeart,
}: HeartButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hearted, setHearted] = useState(initialHearted);
  const [isPending, setIsPending] = useState(false);

  const onToggleHeart = async () => {
    setIsPending(true);
    const result = await toggleHeart(postId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setCount(result.data.count);
    setHearted(result.data.hearted);
  };

  return (
    <div className="bg-white px-4 pb-3">
      <button
        type="button"
        onClick={onToggleHeart}
        disabled={!canHeart || isPending}
        aria-label={
          canHeart
            ? hearted
              ? 'Remove heart from this post'
              : 'Add heart to this post'
            : 'Sign in to heart posts'
        }
        aria-pressed={hearted}
        className="rounded-md border border-gray-300 px-3 py-1 text-sm text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {hearted ? '♥' : '♡'} {count} {count === 1 ? 'heart' : 'hearts'}{' '}
        {isPending ? (
          <>
            <span aria-hidden="true">...</span>
            <span className="sr-only">Loading</span>
          </>
        ) : null}
      </button>
      {!canHeart ? (
        <p className="mt-1 text-xs text-gray-500">Sign in to add hearts.</p>
      ) : null}
    </div>
  );
}
