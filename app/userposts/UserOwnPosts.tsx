import DeletePost from './DeletePost';
import { auth } from '@/auth';
import { getCachedUserPosts } from '@/app/userposts/getUserPosts';
import { UserPosts } from '@/types/UserPosts';
import Image from 'next/image';

export default async function UserOwnPosts() {
  const session = await auth();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response: UserPosts = await getCachedUserPosts(session.user?.id ?? '');

  return (
    <div>
      <h2 className="m-3 text-sm font-semibold text-muted-foreground">
        You have {response.posts.length} posts.
      </h2>
      {response.posts.length === 0 && (
        <h1 className="m-3 text-muted-foreground">
          Go back to the &apos;Chat Room&apos; and create you first post!
        </h1>
      )}
      {response.posts.map((post) => (
        <div
          key={post.id}
          className="mt-2 rounded-xl border border-border bg-surface p-3"
        >
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
              className="mt-2 rounded-lg border border-border bg-surface-2 p-3 text-foreground"
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
                <h3 className="font-bold">
                  {comment.user.name || 'Anonymous'}
                </h3>
                <h2 className="text-sm text-muted-foreground">
                  {typeof comment.createdAt === 'string'
                    ? comment.createdAt
                    : comment.createdAt?.toLocaleDateString()}
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
