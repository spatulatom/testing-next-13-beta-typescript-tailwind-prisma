import Post from '../Post';
import AddComment from './AddComment';
import Image from 'next/image';

import { PostType } from '../../types/Post';
import { notFound } from 'next/navigation';
import singlePost from '@/unstableCache/singlepost';

export default async function PostDetail(props: {
  params: Promise<{ post: string }>;
}) {
  const params = await props.params;
  const response = await singlePost(params.post);
  if (!response) {
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
      {response.comments?.map((comment) => (
        <div
          key={comment.id}
          className="mt-2 rounded-md bg-gray-300 p-2 text-black"
        >
          <div className="flex items-center gap-2">
            <Image
              width={24}
              height={24}
              src={comment.user?.image ?? ''}
              alt="avatar"
              className="rounded-full"
            />
            <h3 className="font-bold">{comment?.user?.name},</h3>
          </div>
          <div className="italic"> - {comment.title}</div>
        </div>
      ))}
    </div>
  );
}
