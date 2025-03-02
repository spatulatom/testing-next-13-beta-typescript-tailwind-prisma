import Image from 'next/image';
import styles from './page.module.css';
import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';
import Counter from './Counter';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import allPosts from '@/unstableCache/allPosts';
import { cookies } from 'next/headers';
import { Post as PrismaPost, User, Comment } from '@prisma/client';

const prisma = new PrismaClient();

const Home = async () => {
  type PostWithRelations = PrismaPost & {
    user: User;
    comments: Comment[];
  };

  cookies();
  // i am using next 14 feature here for data revalidation
  // when grabbing data directly form database andand whanting to opt out of
  //  caching(the verison this app is build is    "next": "^13.2.3",)

  console.log('DATA FETCH HOME PAGE1');

  try {
    // noStore()
    const data: PostWithRelations[] = await allPosts();

    if (!data || data.length === 0) {
      notFound();
    }

    return (
      <div>
       <h1 className="text-center font-bold text-4xl md:text-5xl uppercase mt-10 mb-28 animate-shimmer bg-gradient-to-r from-teal-600 via-black to-white text-transparent bg-clip-text">Chat Room</h1>
        {/* <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={60}
            height={12}
            priority
          />
          <div className={styles.thirteen}>
            <h2 className="font-bold">14</h2>
          </div>
        </div> */}

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
    // await prisma.$disconnect();
  }
};

export default Home;
