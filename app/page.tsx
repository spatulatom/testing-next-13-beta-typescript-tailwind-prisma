import Image from 'next/image';

import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';
import Counter from './Counter';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import allPosts from '@/unstableCache/allPosts';
import { cookies } from 'next/headers';
import { Post as PrismaPost, User, Comment } from '@prisma/client';
import Boundary from '@/boundry/Boundary';
import { Suspense } from 'react';
import Link from 'next/link';

const Home = async () => {
  type PostWithRelations = PrismaPost & {
    user: User;
    comments: Comment[];
  };

  console.log('DATA FETCH HOME PAGE1');

  try {
    // noStore()
    const data: PostWithRelations[] = await allPosts();

    if (!data || data.length === 0) {
      return (
        <div className="mb-20">
          <h1 className="text-center font-bold text-xl md:text-5xl mt-10 mb-2 bg-gradient-to-r from-teal-600 via-black to-white  bg-clip-text">
            Chat Room
          </h1>

          <AddPost />
          <div className="flex flex-col items-center justify-center ">
            <h2 className="text-xl font-bold">No Posts Yet</h2>
            <p className="text-gray-600 mt-2">
              You haven't created any posts yet.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="">
        {/* <h1 className="text-center text-2xl font-bold  mt-10 animate-shimmer bg-gradient-to-r from-teal-600 via-black to-white text-transparent bg-clip-text capitalize">chat Room</h1> */}
        <h1 className="text-center font-bold text-xl mt-10 mb-2 bg-gradient-to-r from-teal-600 via-black to-white  bg-clip-text">
          Chat Room
        </h1>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            {' '}
            this project was one of the early adopters of App Router and React Server
            Components (RSC) introduced in next.js 13 beta,{' '}
          </li>
          <li>
            since then it was migrated to every major next.js version
            implementing new features at every release, from version 13 to 16 (see{' '}
            <Link
              className="text-green-500"
              target="_blank"
              href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
            >
              readme
            </Link>{' '}
            for more details).{' '}
          </li>
         
        </ul>

        <AddPost />
        <Counter count={data.length} />

        {data.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            date={post.createdAt}
            name={post.user.name}
            avatar={post.user.image}
            postTitle={post.title}
            comments={post.comments.length}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return (
      <div>
        <AddPost />
      </div>
    );
  } finally {
  }
};

export default Home;
