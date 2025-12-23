'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import Toggle from './Toggle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type EditProps = {
  id: string;
  avatar: string;
  name: string;
  title: string;
  comments: {
    createdAt?: string; // chck for comments at the bottom of this fiel why this might be seen as optiinal
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
  const queryClient = useQueryClient();
  let deleteToastID: string;
  const router = useRouter();
  const toastIdRef = useRef<string>('');

  const { mutate } = useMutation({
    mutationFn: async (postId: string) => {
      return await axios.delete(`/api/deletepost/${postId}`);
    },
    onError: (error) => {
      console.log('DELETE ERROR', error);
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data.message, { id: toastIdRef.current });
      } else {
        toast.error('Connection error, check your url.', {
          id: toastIdRef.current,
        });
      }
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ['getAuthPosts'] });
      toast.success('Post has been deleted.', { id: toastIdRef.current });
      router.refresh();
    },
  });

  const deletePost = () => {
    // Create a new loading toast and store its ID
    toastIdRef.current = toast.loading('Deleting your post.');
    mutate(id);
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
          {/* <Comment comments={comments}/> */}
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
      {toggle && <Toggle deletePost={deletePost} setToggle={setToggle} />}
    </>
  );
}

// model Comment {
//   createdAt DateTime @default(now())  // Always exists as DateTime
// }
// // What happens during JSON serialization:
// DateTime object → JSON string → TypeScript string
// type EditProps = {
//   comments: {
//     createdAt?: string;  // Optional because:
//     // 1. DateTime might not serialize cleanly
//     // 2. JSON.stringify can produce undefined
//     // 3. Network response might omit dates
//   }[];
// }
// // Possible values after serialization:
// createdAt: "2024-03-21T10:00:00.000Z"  // ✅ Success
// createdAt: undefined                    // ✅ Serialization issue
// createdAt: null                         // ✅ Database null
// This is why createdAt is marked optional (?) - to handle potential serialization edge cases, even though it always exists in the database.
