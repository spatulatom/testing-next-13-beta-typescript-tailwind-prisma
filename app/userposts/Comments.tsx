'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
// import { PostType } from '../../../types/Post';
type Props = {
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

export default function Comments({ comments }: Props) {
  
  return (
    <div>
      {comments?.map((comment) => (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ ease: 'easeOut' }}
          className="mt-2 bg-white p-8 rounded-md"
          key={comment.id}
        >
          <div className="flex items-center gap-2">
            <Image
              width={24}
              height={24}
              src={comment.user.image}
              alt="avatar"
            />
            <h3 className="font-bold  text-black">{comment.user.name}</h3>
            <h2 className="text-sm  text-black">{comment.createdAt}</h2>
          </div>
          <div className="py-4  text-black">{comment.title}</div>
        </motion.div>
      ))}
    </div>
  );
}
