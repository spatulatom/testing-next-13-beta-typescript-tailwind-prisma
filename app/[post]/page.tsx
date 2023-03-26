import Post from '../Post';
import AddComment from './AddComment';
import Image from 'next/image';

import { PostType } from '../../types/Post';
import { notFound } from 'next/navigation';

type URL = {
  params: {
    post: string;
  };
  // searchParams: string
};
type Post = { data: PostType };

const fetchDetails = async (id: string) => {
  const data = await fetch(`${process.env.URL}/api/${id}`, {
    cache: 'no-store',
  });
  const response = await data.json();
  if (data.ok) {
    return response.data;
  }
  throw new Error(response.error);
};

// URL below equals to router().query.parans
export default async function PostDetail(url: URL) {
  const response: PostType = await fetchDetails(url.params.post);
  if (!response) {
    // for http.../random number - we can use:
    notFound();
  }
  return (
    <div>
      <Post
        id={response?.id}
        name={response?.user.name}
        avatar={response?.user.image}
        postTitle={response?.title}
        comments={response?.comments}
      />
      <AddComment id={response?.id} />
      <h2>Comments:</h2>
      {response?.comments?.map((comment) => (
        <div className='bg-gray-300 rounded-md text-black p-2 mt-2'>
          <div className="flex items-center gap-2">
            <Image
              width={24}
              height={24}
              src={comment.user?.image}
              alt="avatar"
              className="rounded-full"
            />
            <h3 className="font-bold">{comment?.user?.name}</h3>
            <h2 className="text-sm">{comment.createdAt}</h2>
          </div>
          <div className='italic'> - {comment.title}</div>
        </div>
      ))}
    </div>
  );
}
