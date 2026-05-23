'use cache';

import { cacheTag } from 'next/cache';
import prisma from '@/prisma/client';
import {
  buildPostOrderBy,
  buildPostWhere,
  DEFAULT_FEED_SORT,
  type FeedQuery,
} from '@/lib/posts/feed-query';

const allPosts = async (
  feedQuery: FeedQuery = { search: '', sort: DEFAULT_FEED_SORT }
) => {
  cacheTag('posts');

  console.log('DATA FETCH - ALL POSTS');
  const data = await prisma.post.findMany({
    where: buildPostWhere(feedQuery.search),
    include: {
      user: true,
      comments: true,
      hearts: true,
    },
    orderBy: buildPostOrderBy(feedQuery.sort),
  });

  return data;
};

export default allPosts;
