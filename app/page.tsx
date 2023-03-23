import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from './page.module.css';
import Link from 'next/link';

import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';

const inter = Inter({ subsets: ['latin'] });

const allPosts = async () => {
  // when fetching in server component to own backend the full url is needed
  const data = await fetch(process.env.URL + '/api/addpost', {
    cache: 'no-store',
  });
  if (data.ok) {
    const res = await data.json();
    
    return res.data;
  }
  // these are errors if incoming data is not ok and 
  // by throwing them we are enabling error.tsx to catch them
  const message = `An error has occured: ${data.status}`;
  console.log('MESSAGE:' + data);
  throw new Error(message);

  // any other errors that are usally cought in catch(err) block
  // are by default caught by error.tsx - no need to catch&throw them
};

export default async function Home() {
  const response: PostType[] = await allPosts();
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
          <Image src="/thirteen.svg" alt="13" width={40} height={31} priority />
        </div>
      </div>
      {/* <div className="text-center mb-12 relative z-20">
        <a
          href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma"
          target="_blank"
        >
          <i className="fa-brands fa-github fa-2xl text-white "></i>
        </a>
      </div> */}

      <AddPost />
      {response?.map((post) => (
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
}
