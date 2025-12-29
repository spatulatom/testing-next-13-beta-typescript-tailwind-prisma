// 'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
// import { motion } from 'framer-motion';
import { Post as PrismaPost, User } from '@prisma/client';

interface PostProps {
  id: PrismaPost['id'];
  date: PrismaPost['createdAt'];
  name: User['name'];
  avatar: User['image'];
  postTitle: PrismaPost['title'];
  comments: number; // Keep as is - it's a computed value
}

export default function Post({
  id,
  date,
  name,
  avatar,
  postTitle,
  comments,
}: PostProps) {
  let whenNull;
  if (avatar === null) {
    whenNull = '';
  } else {
    whenNull = (
      <Image
        className="rounded-full"
        width={32}
        height={32}
        src={avatar}
        alt="avatar"
      />
    );
  }
  // void cookies();
  const d = new Date(date).toLocaleString().toString();

  console.log(
    'POSTTTTTTTT',
    date,
    typeof date,
    date instanceof Date
    // d.toLocaleString()
  );
  return (
    // <motion.div
    //   animate={{ opacity: 1, scale: 1 }}
    //   initial={{ opacity: 0, scale: 0.8 }}
    //   transition={{ ease: 'easeOut' }}
    //   className="bg-white my-8 p-8 rounded-lg "
    // >
    // </motion.div>
    <Link
      href={{
        pathname: `/${id}`,
      }}
    >
      <div className="flex items-center rounded-t-lg bg-white p-4">
        {whenNull}
        <div className="">
          {' '}
          <h3 className="pl-2 font-bold text-gray-700">{name}</h3>
          <h4 className="pl-2 text-sm text-gray-600">posted on: {d}</h4>
        </div>
      </div>
      <div className="mb-4 rounded-b-lg bg-teal-600 py-6">
        <p className="px-4 text-white">{postTitle}</p>
        <p className="px-4 pt-6 text-sm text-white">Comments: {comments}</p>
      </div>
    </Link>
  );
}
