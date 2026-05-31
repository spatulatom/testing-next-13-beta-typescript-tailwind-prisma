'use cache';

import { cacheTag } from 'next/cache';
import prisma from '@/prisma/client';
import {
  buildPostOrderBy,
  buildPostWhere,
  DEFAULT_FEED_PAGE,
  DEFAULT_FEED_SORT,
  FEED_PAGE_SIZE,
  getFeedPaginationMeta,
  type FeedQuery,
} from '@/lib/posts/feed-query';

const allPosts = async (
  feedQuery: FeedQuery = {
    search: '',
    sort: DEFAULT_FEED_SORT,
    page: DEFAULT_FEED_PAGE,
  }
) => {
  cacheTag('posts');

  console.log('DATA FETCH - ALL POSTS');
  const where = buildPostWhere(feedQuery.search);
  const totalCount = await prisma.post.count({ where });
  const pagination = getFeedPaginationMeta({
    requestedPage: feedQuery.page,
    totalCount,
  });

  const posts = await prisma.post.findMany({
    where,
    include: {
      user: true,
      comments: true,
      hearts: true,
    },
    orderBy: buildPostOrderBy(feedQuery.sort),
    skip: pagination.skip,
    take: FEED_PAGE_SIZE,
  });

  return {
    posts,
    pagination,
  };
};

export default allPosts;
