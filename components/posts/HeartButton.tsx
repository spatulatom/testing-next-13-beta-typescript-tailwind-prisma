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
    <div className="border-t border-border px-4 py-3" aria-live="polite">
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
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          hearted
            ? 'border-transparent bg-accent text-accent-foreground'
            : 'border-border bg-surface text-foreground hover:bg-surface-2'
        }`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {hearted ? '♥' : '♡'}
        </span>{' '}
        {count} {count === 1 ? 'heart' : 'hearts'}{' '}
        {isPending ? (
          <>
            <span aria-hidden="true">...</span>
            <span className="sr-only">Loading</span>
          </>
        ) : null}
      </button>
      {!canHeart ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Sign in to add hearts.
        </p>
      ) : null}
    </div>
  );
}
