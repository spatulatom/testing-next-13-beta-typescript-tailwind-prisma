'use client';

import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  let toastPostID: string;

  const addPost = async (param: string) => {
    try {
      const response = await fetch('/api/addpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(param),
      });
      const data = await response.json();
      router.refresh();
      if (response.ok) {
        setTitle('');
       return toast.success('Post has been made 🔥', { id: toastPostID });
      }
      toast.error(data.error, { id: toastPostID });
    } catch (err) {
      return toast.error('Database connection error. Try again in minute!', { id: toastPostID });
    }
  };

  const submitPost = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisabled(false);
    addPost(title);
    console.log('CLICK');
    toastPostID = toast.loading('Creating your post', { id: toastPostID });
  };

  return (
    <form onSubmit={submitPost} className="bg-white my-8 p-8 rounded-md ">
      <div className="flex flex-col my-4">
        <textarea
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          name="title"
          placeholder="What's on your mind?"
          className="p-4 text-lg text-black rounded-md my-2  bg-gray-200"
        />
      </div>
      <div className=" flex items-center justify-between gap-2">
        <p
          className={`font-bold text-sm ${
            title.length > 30 ? 'text-red-700' : 'text-gray-700'
          } `}
        >{`${title.length}/300`}</p>
        <button
          disabled={isDisabled}
          className="text-sm bg-teal-600 text-white py-2 px-6 rounded-xl disabled:opacity-25"
          type="submit"
        >
          Createe post
        </button>
      </div>
    </form>
  );
}
