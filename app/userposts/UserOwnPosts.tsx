'use client';

import DeletePost from './DeletePost';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UserPosts } from '../../types/UserPosts';
import Image from 'next/image';

const fetchAuthPost = async () => {
  const response = await axios.get('/api/userposts');
  return response.data;
};

export default function UserOwnPosts() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['getAuthPosts'],
    queryFn: fetchAuthPost,
  });
  if (isLoading)
    return <h1 className="m-4 text-center">Posts are loading...</h1>;
  if (error) {
    console.log('Error', error);
  }
  if (error) throw new Error('Error while getting user posts. We are sorry!');
  const response: UserPosts = data;
  return (
    <div>
      <h2 className="m-3">You have {response.posts.length} posts.</h2>
      {response.posts.length === 0 && (
        <h1 className="m-3">
          Go back to the 'Chat Room' and create you first post!
        </h1>
      )}
      {response.posts.map((post) => (
        <div key={post.id} className="mt-2 rounded-md bg-gray-200 p-2">
          <DeletePost
            id={post.id}
            key={post.id}
            avatar={response.image}
            name={response.name}
            title={post.title}
            comments={post.comments}
          />
          {post.comments?.map((comment) => (
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
                <h3 className="font-bold">{comment.user.name}</h3>
                <h2 className="text-sm">{comment.createdAt}</h2>
              </div>
              <div className="italic"> - {comment.title}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
