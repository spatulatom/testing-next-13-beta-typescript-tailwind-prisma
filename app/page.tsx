import Post from '@/components/posts/Post';
import AddPost from '@/components/posts/AddPost';
import Counter from '@/components/posts/Counter';
import allPosts from '@/app/allPosts';
import { auth } from '@/auth';
import type { Comment, Heart, Post as PrismaPost, User } from '@prisma/client';
import { Suspense } from 'react';
import FeedControls from '@/components/posts/FeedControls';
import FeedPagination from '@/components/posts/FeedPagination';
import FeedSortControl from '@/components/posts/FeedSortControl';
import { redirect } from 'next/navigation';
import {
  buildFeedHref,
  normalizeFeedSearchParams,
  type FeedPaginationMeta,
  type FeedQuery,
  type FeedSearchParams,
} from '@/lib/posts/feed-query';

type PostWithRelations = PrismaPost & {
  user: User;
  comments: Comment[];
  hearts: Heart[];
};

type FeedResult = {
  posts: PostWithRelations[];
  pagination: FeedPaginationMeta;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<FeedSearchParams>;
}) {
  return (
    <Suspense fallback={<div className="py-6">Loading posts...</div>}>
      <HomeWithSession searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeWithSession({
  searchParams,
}: {
  searchParams: Promise<FeedSearchParams>;
}) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const feedQuery = normalizeFeedSearchParams(params);
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const hasPageParam = rawPage !== undefined;
  const shouldNormalizePageParam =
    hasPageParam && rawPage !== String(feedQuery.page);
  const feedResult: FeedResult = await allPosts(feedQuery);
  const { pagination } = feedResult;

  if (
    pagination.currentPage !== feedQuery.page ||
    shouldNormalizePageParam ||
    (hasPageParam && pagination.currentPage === 1)
  ) {
    redirect(buildFeedHref(feedQuery, pagination.currentPage));
  }

  return (
    <HomeContent
      userId={session?.user?.id ?? null}
      feedQuery={feedQuery}
      feedResult={feedResult}
    />
  );
}

function HomeContent({
  userId,
  feedQuery,
  feedResult,
}: {
  userId: string | null;
  feedQuery: FeedQuery;
  feedResult: FeedResult;
}) {
  console.log('DATA FETCH HOME PAGE1');

  const { posts, pagination } = feedResult;
  const hasActiveFilters = Boolean(
    feedQuery.search || feedQuery.sort !== 'newest'
  );

  if (pagination.totalCount === 0) {
    return (
      <div className="mb-20">
        <h1 className="mt-1 mb-2 bg-linear-to-r from-teal-600 via-black to-white bg-clip-text text-center text-xl font-bold md:text-5xl">
          Chat Room
        </h1>

        <AddPost />
        <Suspense fallback={<div className="mb-4 h-28 rounded-md bg-white" />}>
          <FeedControls currentQuery={feedQuery} />
        </Suspense>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold">
            {hasActiveFilters ? 'No posts match your search' : 'No Posts Yet'}
          </h2>
          <p className="mt-2 text-gray-600">
            {hasActiveFilters
              ? 'Try a different search, switch sorting, or reset the feed.'
              : "You haven't created any posts yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* <h1 className="text-center text-2xl font-bold  mt-10 animate-shimmer bg-gradient-to-r from-teal-600 via-black to-white text-transparent bg-clip-text capitalize">chat Room</h1> */}
      <h1 className="mt-10 mb-2 bg-linear-to-r from-teal-600 via-black to-white bg-clip-text text-center text-xl font-bold">
        Chat Room - crud app with{' '}
        <a
          className="text-teal-600 hover:underline focus:underline"
          target="_blank"
          href="https://nextjs.org/docs/app/getting-started/cache-components"
        >
          Cached Components
        </a>
      </h1>
      <p className="ml-6 list-disc space-y-1">
        {' '}
        This project tested App Router and React Server Components (RSC) when
        they were first introduced in Next.js 13 Beta (in 2023). <br />
        Since then the project was migrated to every major Next.js version
        trying some new features at every release, from version 13 to 16+ (see{' '}
        <a
          className="text-teal-600 hover:underline focus:underline"
          target="_blank"
          href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
        >
          readme
        </a>{' '}
        for more details).{' '}
      </p>

      <AddPost />
      <Suspense fallback={<div className="mb-4 h-28 rounded-md bg-white" />}>
        <FeedControls currentQuery={feedQuery} />
      </Suspense>
      <div className="mb-2 flex flex-col justify-between md:flex-row md:items-center">
        <Counter count={pagination.totalCount} />
        <Suspense
          fallback={<div className="m-2 h-11 w-56 rounded-md bg-white" />}
        >
          <FeedSortControl currentQuery={feedQuery} />
        </Suspense>
      </div>
      <p className="m-2 text-sm text-gray-600 dark:text-gray-300">
        Showing page {pagination.currentPage} of {pagination.totalPages}
      </p>

      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          date={post.createdAt}
          name={post.user.name}
          avatar={post.user.image}
          postTitle={post.title}
          comments={post.comments.length}
          hearts={post.hearts.length}
          heartedByCurrentUser={Boolean(
            userId && post.hearts.some((heart) => heart.userId === userId)
          )}
          canToggleHeart={Boolean(userId)}
        />
      ))}
      <FeedPagination currentQuery={feedQuery} pagination={pagination} />
    </div>
  );
}
