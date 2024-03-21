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





const prisma = new PrismaClient();

const Home = async () => {
  cookies()
  // i am using next 14 feature here for data revalidation
  // when grabbing data directly form database andand whanting to opt out of
  //  caching(the verison this app is build is    "next": "^13.2.3",)

  console.log('DATA FETCH HOME PAGE1')
  
  try {
    // noStore()
  const data = await allPosts()

    if (!data || data.length === 0) {
      notFound();
    }

    return (
      <div>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
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
