import type { Prisma } from '@prisma/client';
import { sanitizeText } from '@/lib/validation';

export const FEED_SORTS = ['newest', 'oldest', 'most-commented'] as const;
export const DEFAULT_FEED_SORT = 'newest';
export const MAX_FEED_SEARCH_LENGTH = 50;

export type FeedSort = (typeof FEED_SORTS)[number];

export type FeedQuery = {
  search: string;
  sort: FeedSort;
};

export type FeedSearchParams = {
  search?: string | string[];
  sort?: string | string[];
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

export function normalizeFeedSearchParams(
  searchParams: FeedSearchParams
): FeedQuery {
  const rawSearch = firstParamValue(searchParams.search);
  const rawSort = firstParamValue(searchParams.sort);
  const sanitizedSearch = sanitizeText(rawSearch).slice(
    0,
    MAX_FEED_SEARCH_LENGTH
  );

  return {
    search: sanitizedSearch,
    sort: isFeedSort(rawSort) ? rawSort : DEFAULT_FEED_SORT,
  };
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
