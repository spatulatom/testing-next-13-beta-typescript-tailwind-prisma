'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_FEED_SORT,
  FEED_SORTS,
  type FeedQuery,
  type FeedSort,
} from '@/lib/posts/feed-query';

const sortLabels: Record<FeedSort, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  'most-commented': 'Most commented',
};

type FeedSortControlProps = {
  currentQuery: FeedQuery;
};

export default function FeedSortControl({
  currentQuery,
}: FeedSortControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function changeSort(nextSort: FeedSort) {
    const params = new URLSearchParams(searchParams.toString());

    if (currentQuery.search) {
      params.set('search', currentQuery.search);
    } else {
      params.delete('search');
    }

    if (nextSort === DEFAULT_FEED_SORT) {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }

    params.delete('page');

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    startTransition(() => {
      router.push(nextUrl);
    });
  }

  return (
    <label className="m-2 flex items-center gap-2 text-sm font-semibold text-foreground">
      Sort by:
      <select
        value={currentQuery.sort}
        onChange={(event) => changeSort(event.target.value as FeedSort)}
        className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 py-2 text-base font-normal text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={isPending}
      >
        {FEED_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {sortLabels[sort]}
          </option>
        ))}
      </select>
    </label>
  );
}
