import Image from 'next/image';
import { Inter, Moon_Dance } from 'next/font/google';
import styles from './page.module.css';
import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';

const inter = Inter({ subsets: ['latin'] });


// NOT making Prisma calls here what is possible since this is a server
// componet since we want to have more control over has this page is rendered
//  - when Prisma call made here this page will be defult SSG.
// FETCH from server components to our own backend requries full URL as oppose to partial
// form client components for example in AddPost.tsx

const allPosts = async ():Promise<PostType[]>=> {
  const data = await fetch(process.env.URL + '/api/addpost', {
    cache: 'no-store',
  });
  if (data.ok) {
    const res = await data.json();
    return res.data;
  }
  const error = await data.json();
  console.log('MESSAGE:', error);
  throw new Error(error.error);
};
let bla: Array<string>;
bla = ['fasad'];

const Home = async () => {
  // const response: PostType[] = await allPosts(); //you can also set return data type here
  const response= await allPosts();
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

      <AddPost />
      <h2 className="ml-2">
        All posts: {response.length}
      </h2>
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
};

export default Home;
