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

  await cookies();
  // i am using next 14 feature here for data revalidation
  // when grabbing data directly form database andand whanting to opt out of
  //  caching(the verison this app is build is    "next": "^13.2.3",)

  console.log('DATA FETCH HOME PAGE1');

  try {
    // noStore()
    const data: PostWithRelations[] = await allPosts();

    if (!data || data.length === 0) {
    
      return <div className='mb-20'>
      {/* <h1 className="text-center font-bold text-4xl md:text-5xl mt-10 mb-2 animate-shimmer bg-gradient-to-r from-teal-600 via-black to-white text-transparent bg-clip-text">Chat</h1> */}
      <h1 className="text-center font-bold text-4xl md:text-5xl mt-10 mb-2 bg-gradient-to-r from-teal-600 via-black to-white  bg-clip-text">Chat Room</h1>
       <div className={styles.center}>
         <Image
           className={styles.logo}
           src="/next.svg"
           alt="Next.js Logo"
           width={60}
           height={12}
           priority
         />
         <div className={styles.thirteen}>
           <h2 className="font-bold text-teal-400">^16.1.0</h2>
         </div>
       </div>

       <AddPost />
      <div className="flex flex-col items-center justify-center ">
        <h2 className="text-xl font-bold">No Posts Yet</h2>
        <p className="text-gray-600 mt-2">You haven't created any posts yet.</p>
    </div></div>
    }

    return (
      <div className='mb-20'>
       {/* <h1 className="text-center font-bold text-4xl md:text-5xl mt-10 mb-2 animate-shimmer bg-gradient-to-r from-teal-600 via-black to-white text-transparent bg-clip-text">Chat</h1> */}
       <h1 className="text-center font-bold text-4xl md:text-5xl mt-10 mb-2 bg-gradient-to-r from-teal-600 via-black to-white  bg-clip-text">Chat Room</h1>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={60}
            height={12}
            priority
          />
          <div className={styles.thirteen}>
            <h2 className="font-bold text-teal-400">^15.2.3</h2>
          </div>
        </div>

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
