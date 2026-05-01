import DeletePost from './DeletePost';
import Image from 'next/image';
import type { UserWithPosts } from '@/app/userposts/page';

type Props = {
  userData: UserWithPosts | null;
};

export default function UserOwnPosts({ userData }: Props) {
  if (!userData) {
    return <h1 className="m-4 text-center">No user data found.</h1>;
  }
  return (
    <div>
      <h2 className="m-3">You have {userData.posts.length} posts.</h2>
      {userData.posts.length === 0 && (
        <h1 className="m-3">
          Go back to the &apos;Chat Room&apos; and create your first post!
        </h1>
      )}
      {userData.posts.map((post) => (
        <div key={post.id} className="mt-2 rounded-md bg-gray-200 p-2">
          <DeletePost
            id={post.id}
            key={post.id}
            avatar={userData.image ?? ''}
            name={userData.name ?? ''}
            title={post.title}
            comments={post.comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            }))}
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
                  src={comment.user?.image ?? '/next13beta.png'}
                  alt="avatar"
                  className="rounded-full"
                />
                <h3 className="font-bold">{comment.user.name}</h3>
                <h2 className="text-sm">
                  {comment.createdAt.toLocaleDateString()}
                </h2>
              </div>
              <div className="italic"> - {comment.title}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
