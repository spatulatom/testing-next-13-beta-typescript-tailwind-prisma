import Image from 'next/image';
import styles from './page.module.css';
import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';
import Counter from './Counter';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const Home = async () => {
  console.log('HERRRRRRRRRRRRRR not LOGGED');

  try {
    const data = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        hearts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // console.log('foundddddd', data);

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
        <Counter count={data} />

        {data.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            name={post.user.name}
            avatar={post.user.image}
            postTitle={post.title}
            comments={post.comments}
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
