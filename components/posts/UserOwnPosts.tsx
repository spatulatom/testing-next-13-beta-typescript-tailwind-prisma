import DeletePost from './DeletePost';
import { getUserPosts } from '@/app/userposts/actions';
import { UserPosts } from '@/types/UserPosts';
import Image from 'next/image';

export default async function UserOwnPosts() {
  const result = await getUserPosts();

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.success || !result.data) {
    throw new Error('Failed to fetch posts');
  }

  const response: UserPosts = result.data;

  return (
    <div>
      <h2 className="m-3">You have {response.posts.length} posts.</h2>
      {response.posts.length === 0 && (
        <h1 className="m-3">
          Go back to the &apos;Chat Room&apos; and create you first post!
        </h1>
      )}
      {response.posts.map((post) => (
        <div key={post.id} className="mt-2 rounded-md bg-gray-200 p-2">
          <DeletePost
            id={post.id}
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
                {comment.user?.image && (
                  <Image
                    width={24}
                    height={24}
                    src={comment.user.image}
                    alt="avatar"
                    className="rounded-full"
                  />
                )}
                <h3 className="font-bold">{comment.user.name || 'Anonymous'}</h3>
                <h2 className="text-sm">{typeof comment.createdAt === 'string' ? comment.createdAt : comment.createdAt?.toLocaleDateString()}</h2>
              </div>
              <div className="italic"> - {comment.title}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
