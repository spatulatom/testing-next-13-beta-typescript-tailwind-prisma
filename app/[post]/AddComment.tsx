'use client';

import { useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Comment = {
  postId?: string;
  title: string;
};
type PostProps = {
  id: string;
};
export default function AddComment({ id }: PostProps) {
  const router = useRouter();
  const commentToastId = useRef<string | undefined>(undefined);
  console.log(id);
  const [title, setTitle] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const addComment = async (arg1: string, arg2: string) => {
    const param = {
      title: arg1,
      id: arg2,
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
        router.refresh();
        setTitle('');
        setIsDisabled(false);
        router.refresh();
        return toast.success('Added your comment', {
          id: commentToastId.current,
        });
      }
      toast.error(data.error, { id: commentToastId.current });
      setIsDisabled(false);
    } catch (err) {
      toast.error('Database connection error.', { id: commentToastId.current });
      setIsDisabled(false);
    }
  };
  // we can set title like this - not recommended - but only in clinet component
  // we shloud never update out dom using pure javaScript
  // document.title = "JavaScript DOM Update"

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

    setIsDisabled(true);
    commentToastId.current = toast.loading('Adding your comment', {
      id: commentToastId.current,
    });
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
          className="my-2 rounded-md bg-white p-4 text-base text-black"
          placeholder="your comment..."
          maxLength={30}
          minLength={1}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={isDisabled}
          className="rounded-xl bg-teal-600 px-6 py-2 text-sm text-white disabled:opacity-25"
          type="submit"
        >
          Add a comment 🚀
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
