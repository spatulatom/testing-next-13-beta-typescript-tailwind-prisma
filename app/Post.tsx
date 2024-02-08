'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
interface PostProps {
  id: string;
  date: Date;
  name: string | null;
  avatar: string | null;
  postTitle: string;
  comments: number;
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
  const d = new Date(date).toLocaleString().toString()

  console.log(
    'POSTTTTTTTT',
    date,
    typeof date,
    date instanceof Date,
    // d.toLocaleString()
  );
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      transition={{ ease: 'easeOut' }}
      className="bg-white my-8 p-8 rounded-lg "
    >
      <Link
        href={{
          pathname: `/${id}`,
        }}
      >
        <div className="flex items-center gap-2">
          {whenNull}
          <div className=''>
            {' '}
            <h3 className="font-bold text-gray-700">{name}</h3>
            <h4 className="text-gray-600 text-sm">posted on: {d}</h4>
          </div>
        </div>
        <div className="py-6 my-2 bg-teal-600 rounded-lg">
          <p className="break-all text-white px-4">{postTitle}</p>
        </div>
        <div className="flex gap-4 cursor-pointer items-center">
          <p className=" text-sm text-gray-700">
            Comments: {comments}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
