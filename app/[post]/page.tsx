import Post from '../_ui/posts/Post';
import AddComment from './_ui/AddComment';
import Image from 'next/image';

import { notFound } from 'next/navigation';
import singlePost from '@/server-cache/singlepost';
import type { Metadata } from 'next';

type PostParams = { params: Promise<{ post: string }> };

export async function generateMetadata({
  params,
}: PostParams): Promise<Metadata> {
  const { post } = await params;
  const data = await singlePost(post);

  if (!data) {
    return { title: 'Post Not Found' };
  }

  return {
    title: data.title,
    description: `Post by ${data.user.name}`,
  };
}

export default async function PostDetail({ params }: PostParams) {
  const { post } = await params;
  // const response: PostType= await fetchDetails(url.params.post);
  const response: any = await singlePost(post);
  if (!response) {
    // for http.../random number - we can use:
    notFound();
  }
  return (
    <div>
      <Post
        date={response.createdAt}
        id={response?.id}
        name={response?.user.name}
        avatar={response?.user.image}
        postTitle={response?.title}
        comments={response?.comments.length}
      />
      <AddComment id={response?.id} />
      <h2>Comments:</h2>
      {response.comments?.map((comment: any) => (
        <div
          key={comment.id}
          className="mt-2 rounded-md bg-gray-300 p-2 text-black"
        >
          <div className="flex items-center gap-2">
            <Image
              width={24}
              height={24}
              src={comment.user?.image}
              alt="avatar"
              className="rounded-full"
            />
            <h3 className="font-bold">{comment?.user?.name},</h3>
            {/* <h2 className="text-sm">commented at {comment.createdAt?.substring(11, 19)}, {comment.createdAt?.substring(0,10)}</h2> */}
          </div>
          <div className="italic"> - {comment.title}</div>
        </div>
      ))}
    </div>
  );
}
