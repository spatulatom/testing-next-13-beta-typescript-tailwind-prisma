'use client';

import { useState, useTransition, useRef } from 'react';

import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type PostProps = {
  id: string;
};

export default function AddComment({ id }: PostProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [isPending, startTransition] = useTransition();
  const toastIdRef = useRef<string>('');

  const addComment = async (commentTitle: string, postId: string) => {
    const param = {
      title: commentTitle,
      id: postId,
    };

    try {
      const response = await fetch('/api/addcomment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(param),
      });
      const data = await response.json();
      
      if (response.ok) {
        setTitle('');
        toast.success('Added your comment', { id: toastIdRef.current });
        // Use startTransition for non-urgent UI updates
        startTransition(() => {
          router.refresh();
        });
        return;
      }
      toast.error(data.error, { id: toastIdRef.current });
    } catch (err) {
      toast.error('Database connection error.', { id: toastIdRef.current });
    }
  };

  const submitPost = async (e: React.FormEvent) => {
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

    toastIdRef.current = toast.loading('Adding your comment');
    addComment(title, id);
  };

  return (
    <form onSubmit={submitPost} className="my-8">
      <h3 className="text-xl">Add a comment</h3>

      <div className="my-2 flex flex-col">
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          type="text"
          name="title"
          className="text-md my-2 rounded-md bg-white p-4 text-black"
          placeholder="your comment..."
          maxLength={30}
          minLength={1}
          disabled={isPending}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={isPending}
          className="rounded-xl bg-teal-600 px-6 py-2 text-sm text-white disabled:opacity-25"
          type="submit"
        >
          {isPending ? 'Adding...' : 'Add a comment 🚀'}
        </button>
        <p
          className={`font-bold text-white ${
            title.length > 30 ? 'text-red-700' : 'text-gray-700'
          } `}
        >{`${title.length}/30`}</p>
      </div>
    </form>
  );
}
