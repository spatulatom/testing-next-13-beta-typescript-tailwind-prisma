'use client';

import Image from 'next/image';
import { useState, useRef, useTransition } from 'react';
import Toggle from './Toggle';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { deletePost } from '@/lib/actions/post';

type EditProps = {
  id: string;
  avatar: string;
  name: string;
  title: string;
  comments: {
    // ISO string – the parent server component serialises Date → string
    // before crossing the server/client boundary to this client component.
    createdAt: string;
    id: string;
    postId: string;
    title: string;
    userId: string;
    user: {
      email: string;
      id: string;
      image: string;
      name: string;
    };
  }[];
};

export default function DeletePost({
  avatar,
  name,
  title,
  comments,
  id,
}: EditProps) {
  const [toggle, setToggle] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const toastIdRef = useRef<string>('');

  const handleDelete = () => {
    toastIdRef.current = toast.loading('Deleting your post.');
    startTransition(async () => {
      const result = await deletePost(id);
      if (result.success) {
        toast.success('Post has been deleted.', { id: toastIdRef.current });
        router.refresh();
      } else {
        toast.error(result.error, { id: toastIdRef.current });
      }
    });
  };

  return (
    <>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ ease: 'easeOut' }}
        className="my-8 mb-1 rounded-lg bg-white p-8"
      >
        <div className="flex items-center gap-2">
          <Image width={32} height={32} src={avatar} alt="avatar" />
          <h3 className="font-bold text-gray-700">{name}</h3>
        </div>
        <div className="my-8">
          <p className="break-all text-black">{title}</p>
        </div>
        <div className="flex justify-between gap-4">
          <p className="text-sm font-bold text-gray-700">
            {comments?.length} Comments:
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToggle(true);
            }}
            className="text-sm font-bold uppercase text-red-500"
          >
            Delete
          </button>
        </div>
      </motion.div>
      {toggle && <Toggle deletePost={handleDelete} setToggle={setToggle} />}
    </>
  );
}
