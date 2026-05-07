'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import Toggle from '@/app/userposts/Toggle';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { deletePost } from '@/app/actions';
import type { DeletePostProps } from '@/types/ComponentProps';

export default function DeletePost({
  avatar,
  name,
  title,
  comments,
  id,
}: DeletePostProps) {
  const [toggle, setToggle] = useState(false);
  const toastIdRef = useRef<string>('');

  const handleDelete = async () => {
    toastIdRef.current = toast.loading('Deleting your post.');
    const result = await deletePost(id);

    if (!result.success) {
      toast.error(result.error, { id: toastIdRef.current });
      return;
    }

    toast.success('Post has been deleted.', { id: toastIdRef.current });
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
          {avatar && <Image width={32} height={32} src={avatar} alt="avatar" />}
          <h3 className="font-bold text-gray-700">{name || 'Anonymous'}</h3>
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
            className="text-sm font-bold text-red-500 uppercase"
          >
            Delete
          </button>
        </div>
      </motion.div>
      {toggle && <Toggle deletePost={handleDelete} setToggle={setToggle} />}
    </>
  );
}
