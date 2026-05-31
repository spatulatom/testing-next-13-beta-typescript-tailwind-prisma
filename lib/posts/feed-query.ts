import type { Prisma } from '@prisma/client';
import { sanitizeText } from '@/lib/validation';

export const FEED_SORTS = ['newest', 'oldest', 'most-commented'] as const;
export const DEFAULT_FEED_SORT = 'newest';
export const DEFAULT_FEED_PAGE = 1;
export const FEED_PAGE_SIZE = 3;
export const MAX_FEED_SEARCH_LENGTH = 50;

export type FeedSort = (typeof FEED_SORTS)[number];

export type FeedQuery = {
  search: string;
  sort: FeedSort;
  page: number;
};

export type FeedPaginationMeta = {
  requestedPage: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  skip: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type FeedSearchParams = {
  search?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

function firstParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export function isFeedSort(value: string): value is FeedSort {
  return FEED_SORTS.includes(value as FeedSort);
}

function normalizeFeedPage(value: string): number {
  const trimmedValue = value.trim();

  if (!/^\d+$/.test(trimmedValue)) {
    return DEFAULT_FEED_PAGE;
  }

  const page = Number(trimmedValue);

  if (!Number.isSafeInteger(page) || page < DEFAULT_FEED_PAGE) {
    return DEFAULT_FEED_PAGE;
  }

  return page;
}

export function normalizeFeedSearchParams(
  searchParams: FeedSearchParams
): FeedQuery {
  const rawSearch = firstParamValue(searchParams.search);
  const rawSort = firstParamValue(searchParams.sort);
  const rawPage = firstParamValue(searchParams.page);
  const sanitizedSearch = sanitizeText(rawSearch).slice(
    0,
    MAX_FEED_SEARCH_LENGTH
  );

  return {
    search: sanitizedSearch,
    sort: isFeedSort(rawSort) ? rawSort : DEFAULT_FEED_SORT,
    page: normalizeFeedPage(rawPage),
  };
}

export function getFeedPaginationMeta({
  requestedPage,
  totalCount,
}: {
  requestedPage: number;
  totalCount: number;
}): FeedPaginationMeta {
  const safeTotalCount = Math.max(0, totalCount);
  const totalPages = Math.max(
    DEFAULT_FEED_PAGE,
    Math.ceil(safeTotalCount / FEED_PAGE_SIZE)
  );
  const currentPage = Math.min(
    Math.max(requestedPage, DEFAULT_FEED_PAGE),
    totalPages
  );

  return {
    requestedPage,
    currentPage,
    totalPages,
    totalCount: safeTotalCount,
    pageSize: FEED_PAGE_SIZE,
    skip: (currentPage - DEFAULT_FEED_PAGE) * FEED_PAGE_SIZE,
    hasPreviousPage: currentPage > DEFAULT_FEED_PAGE,
    hasNextPage: currentPage < totalPages,
  };
}

export function buildFeedHref(feedQuery: FeedQuery, page: number): string {
  const params = new URLSearchParams();

  if (feedQuery.search) {
    params.set('search', feedQuery.search);
  }

  if (feedQuery.sort !== DEFAULT_FEED_SORT) {
    params.set('sort', feedQuery.sort);
  }

  if (page > DEFAULT_FEED_PAGE) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
}

export function buildPostWhere(search: string): Prisma.PostWhereInput {
  if (!search) {
    return {};
  }

  return {
    OR: [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        user: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ],
  };
}

export function buildPostOrderBy(
  sort: FeedSort
): Prisma.PostOrderByWithRelationInput[] {
  if (sort === 'oldest') {
    return [{ createdAt: 'asc' }, { id: 'asc' }];
  }

  if (sort === 'most-commented') {
    return [
      { comments: { _count: 'desc' } },
      { createdAt: 'desc' },
      { id: 'asc' },
    ];
  }

  return [{ createdAt: 'desc' }, { id: 'asc' }];
}
