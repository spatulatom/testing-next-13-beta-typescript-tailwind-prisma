'use client';

import toast from 'react-hot-toast';
import { useRef, useState } from 'react';
import { createPost } from '@/app/actions';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const toastPostID = useRef<string | undefined>(undefined);

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!title.trim().length) {
      toast.error('Please write something before posting.');
      return;
    }

    if (title.length > 50) {
      toast.error('Your post is too long. Please keep it under 50 characters.');
      return;
    }

    // Check for HTML tags, particularly img tags
    if (/<[^>]*>/.test(title)) {
      toast.error('HTML tags are not allowed in posts.');
      return;
    }

    setIsDisabled(true);
    toastPostID.current = toast.loading('Creating your post', {
      id: toastPostID.current,
    });

    const result = await createPost(title);

    if (!result.success) {
      toast.error(result.error, { id: toastPostID.current });
      setIsDisabled(false);
      return;
    }

    setTitle('');
    setIsDisabled(false);
    toast.success('Post has been made 🔥', {
      id: toastPostID.current,
    });
  };

  return (
    <form
      onSubmit={submitPost}
      className="my-8 rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="my-2 flex flex-col">
        <textarea
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          name="title"
          placeholder="Write your post here..."
          rows={3}
          className="resize-y rounded-lg border border-border bg-surface-2 p-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p
          className={`text-sm font-semibold ${
            title.length > 50 ? 'text-danger' : 'text-muted-foreground'
          } `}
        >{`${title.length}/50`}</p>
        <button
          disabled={isDisabled}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
        >
          Create a post
        </button>
      </div>
    </form>
  );
}
