'use client';

import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import allPosts from '@/unstableCache/allPosts';

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      const posts: any = await allPosts();
      console.log('DATAAA', posts);
      setPosts(posts);
      console.log('post', posts);
    };
    getPosts();
  }, [isDisabled]);

  useEffect(() => {
    setIsDisabled(false);
  }, [posts]);

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
      return toast.error('Database connection error. Try again in minute!', {
        id: toastPostID,
      });
    }
  };

  const submitPost = (e: React.FormEvent) => {
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

    addPost(title);
    console.log('CLICK');
    toastPostID = toast.loading('Creating your post', { id: toastPostID });
    setIsDisabled(true);
  };

  return (
    <form onSubmit={submitPost} className="bg-white my-8 p-8 rounded-md ">
      <div className="flex flex-col my-4">
        <textarea
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          name="title"
          placeholder="Write your post here..."
          className="p-4 text-md text-black rounded-md my-2  bg-gray-200"
        />
      </div>
      <div className=" flex items-center justify-between gap-2">
        <p
          className={`font-bold text-sm ${
            title.length > 50 ? 'text-red-700' : 'text-gray-700'
          } `}
        >{`${title.length}/50`}</p>
        <button
          disabled={isDisabled}
          className="text-sm bg-teal-600 text-white py-2 px-6 rounded-xl disabled:opacity-25"
          type="submit"
        >
          Create a post
        </button>
      </div>
    </form>
  );
}
