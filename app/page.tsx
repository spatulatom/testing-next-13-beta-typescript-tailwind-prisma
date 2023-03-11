import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from './page.module.css';
import Link from 'next/link';

import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';

const inter = Inter({ subsets: ['latin'] });

const allPosts = async () => {
  const data = await fetch(process.env.URL + "/api/hello", { cache: 'no-store' })
  const res = await data.json()
  return res.data
}

export default async function Home() {
const response: PostType[] = await allPosts()
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
     <div className="text-center mb-12"><Link href={"https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma"}><i className="fa-brands fa-github fa-2xl text-white absolute md:right-4"></i></Link></div>

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
