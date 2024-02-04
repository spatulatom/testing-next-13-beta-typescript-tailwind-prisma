import Image from 'next/image';
// import { Inter, Moon_Dance } from 'next/font/google';
import styles from './page.module.css';
import Post from './Post';
import AddPost from './AddPost';
import { PostType } from '../types/Post';

// const inter = Inter({ subsets: ['latin'] });
import { notFound } from 'next/navigation';
import Counter from './Counter';

// NOT making Prisma calls here what is possible since this is a server
// componet since we want to have more control over has this 
// page is rendered
//  - when Prisma call made here this page will be defult SSG.
// FETCH from server components to our own backend requries 
// full URL as oppose to partial
// form client components for example in AddPost.tsx

const allPosts = async (): Promise<PostType[]> => {
  try {
    const data = await fetch(process.env.NEXT_PUBLIC_URL + '/api/addpost', {
      cache: 'no-store',
    });
    if (data.ok) {
      const res = await data.json();
      console.log('DATTTTAAA', res)
      return res.data;
     
    }
    console.log('DATTTTAAA', data)
    const error = await data.json();
    throw new Error(error.error);
  } catch (error) {
    console.error('ERRRRRROR fetching posts:', error);
    throw error; // re-throw the error if you want it to propagate
  }
};


// practicing ts syntax, what below equlas to string[]'
// similarly Promise<Postype[]> equals to ...
let bla: Array<string>;
bla = ['fasad'];

const Home = async () => {
  console.log('HERRRRRRRRRRRRRR not LOGGED')
  // const response: PostType[] = await allPosts(); //you can also
  // set return data type here
  const response = await allPosts();
  console.log('foundddddd', response)

  // when using state in client components we can do a check like this:
  // response.length <= 0 && some JSX, can we do that here as well?
  // Tes, we could but we wil use
  // notFound instead
  // side note: response.length && some JSX wont prevent rendering
  // JSX when response = [] becuse
  // event though response.length of empty array in JSX is 0, that
  // is still A VALID VALUE in JSX
  if (!response) {
    // console.log('not foundddddd')
    notFound();
  }
  // we can set title like this - not recommended -
  // but only in clinet component
  // document.title = "JavaScript DOM update"
  return (
    <div>
      {/* <div className={styles.center}>
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
      <Counter count={response} /> */}

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
      <h2>kjhlkjhlhljh;lhlk</h2>
    </div>
  );
};

export default Home;
