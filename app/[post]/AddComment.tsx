'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { createComment } from '@/app/[post]/actions';
import type { AddCommentProps } from '@/types/ComponentProps';

export default function AddComment({ id }: AddCommentProps) {
  const commentToastId = useRef<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!title.trim().length) {
      toast.error('Please write something before posting.');
      return;
    }

    if (title.length > 30) {
      toast.error(
        'Your comment is too long. Please keep it under 30 characters.'
      );
      return;
    }

    // Check for HTML tags
    if (/<[^>]*>/.test(title)) {
      toast.error('HTML tags are not allowed in comments.');
      return;
    }

    setIsDisabled(true);
    commentToastId.current = toast.loading('Adding your comment', {
      id: commentToastId.current,
    });

    const result = await createComment(id, title);

    if (!result.success) {
      toast.error(result.error, { id: commentToastId.current });
      setIsDisabled(false);
      return;
    }

    setTitle('');
    setIsDisabled(false);
    toast.success('Added your comment', {
      id: commentToastId.current,
    });
  };

  return (
    <form onSubmit={submitComment} className="my-8">
      <h3 className="text-xl font-semibold text-foreground">Add a comment</h3>

      <div className="my-2 flex flex-col">
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          type="text"
          name="title"
          className="my-2 rounded-lg border border-border bg-surface p-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="your comment..."
          maxLength={30}
          minLength={1}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={isDisabled}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
        >
          Add a comment
        </button>
        <p
          className={`font-semibold ${
            title.length > 30 ? 'text-danger' : 'text-muted-foreground'
          } `}
        >{`${title.length}/30`}</p>
      </div>
    </form>
  );
}
