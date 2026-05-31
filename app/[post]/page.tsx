import Post from '@/components/posts/Post';
import AddComment from '@/app/[post]/AddComment';
import Image from 'next/image';
import prisma from '@/prisma/client';
import { cacheTag } from 'next/cache';
import { auth } from '@/auth';

import { notFound } from 'next/navigation';
import singlePost from '@/app/[post]/singlepost';
import type { Metadata } from 'next';
import { Suspense } from 'react';

type PostParams = { params: Promise<{ post: string }> };

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
    },
  });

  return posts.map((post) => ({
    post: post.id,
  }));
}

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
    description: `Post by ${data.user.name ?? 'Unknown user'}`,
  };
}

export default async function PostDetail({ params }: PostParams) {
  const { post } = await params;
  return (
    <Suspense fallback={<div className="py-6">Loading post...</div>}>
      <PostDetailWithSession post={post} />
    </Suspense>
  );
}

async function PostDetailWithSession({ post }: { post: string }) {
  const session = await auth();
  return <CachedPostDetail post={post} userId={session?.user?.id ?? null} />;
}

async function CachedPostDetail({
  post,
  userId,
}: {
  post: string;
  userId: string | null;
}) {
  'use cache';

  cacheTag('posts');
  cacheTag(`post-${post}`);
  const response = await singlePost(post);
  if (!response) {
    notFound();
  }
  return (
    <div>
      <Post
        date={response.createdAt}
        id={response.id}
        name={response.user.name}
        avatar={response.user.image}
        postTitle={response.title}
        comments={response.comments.length}
        hearts={response.hearts.length}
        heartedByCurrentUser={Boolean(
          userId && response.hearts.some((heart) => heart.userId === userId)
        )}
        canToggleHeart={Boolean(userId)}
      />
      <AddComment id={response.id} />
      <h2 className="mt-6 mb-2 text-xl font-semibold text-foreground">
        Comments:
      </h2>
      {response.comments.map((comment) => (
        <div
          key={comment.id}
          className="mt-2 rounded-lg border border-border bg-surface-2 p-3 text-foreground"
        >
          <div className="flex items-center gap-2">
            <Image
              width={24}
              height={24}
              src={comment.user.image ?? '/next13beta.png'}
              alt="avatar"
              className="rounded-full"
            />
            <h3 className="font-bold">{comment.user.name},</h3>
            {/* <h2 className="text-sm">commented at {comment.createdAt?.substring(11, 19)}, {comment.createdAt?.substring(0,10)}</h2> */}
          </div>
          <div className="italic"> - {comment.title}</div>
        </div>
      ))}
    </div>
  );
}
