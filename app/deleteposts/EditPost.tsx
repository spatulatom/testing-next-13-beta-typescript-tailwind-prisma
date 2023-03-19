'use client';

import Image from 'next/image';
import { useState } from 'react';
import Toggle from './Toggle';
import { useMutation, useQueryClient } from 'react-query';
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
    createdAt?: string;
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

export default function EditPost({
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

  const { mutate } = useMutation(
    async (id: string) => await axios.delete('/api/deleteposts'),
    {
      onError: (error) => {
        console.log(error);
        if (error instanceof AxiosError) {
          toast.error(error?.response?.data.message, { id: deleteToastID });
        }
      },
      onSuccess: (data) => {
        console.log(data);
        queryClient.invalidateQueries('getAuthPosts');
        toast.success('Post has been deleted.', { id: deleteToastID });
        // router.refresh()
      },
    }
  );

  const deletePost = () => {
    deleteToastID = toast.loading('Deleting your post.', { id: deleteToastID });
    mutate(id);
  };

  return (
    <>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ ease: 'easeOut' }}
        className="bg-white my-8 mb-1 p-8 rounded-lg "
      >
        <div className="flex items-center gap-2">
          <Image width={32} height={32} src={avatar} alt="avatar" />
          <h3 className="font-bold text-gray-700">{name}</h3>
        </div>
        <div className="my-8 ">
          <p className="break-all text-black">{title}</p>
        </div>
        <div className="flex justify-between gap-4 ">
          <p className=" text-sm font-bold text-gray-700">
            {comments?.length} Comments
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
