'use client';

import { useRef, useTransition, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, Search } from 'lucide-react';
import {
  DEFAULT_FEED_SORT,
  type FeedQuery,
  type FeedSort,
} from '@/lib/posts/feed-query';

type FeedControlsProps = {
  currentQuery: FeedQuery;
};

export default function FeedControls({ currentQuery }: FeedControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = Boolean(
    currentQuery.search || currentQuery.sort !== DEFAULT_FEED_SORT
  );

  function buildHref(nextSearch: string, nextSort: FeedSort) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedSearch = nextSearch.trim();

    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    } else {
      params.delete('search');
    }

    if (nextSort === DEFAULT_FEED_SORT) {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }

    params.delete('page');

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function navigate(nextSearch: string, nextSort: FeedSort) {
    startTransition(() => {
      router.push(buildHref(nextSearch, nextSort));
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextSearch = formData.get('search');

    navigate(
      typeof nextSearch === 'string' ? nextSearch : '',
      currentQuery.sort
    );
  }

  function resetFeed() {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }

    navigate('', DEFAULT_FEED_SORT);
  }

  return (
    <section className="mb-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <form onSubmit={submitSearch} className="grid gap-3">
        <label className="order-1 flex flex-col gap-1 text-sm font-semibold text-foreground">
          Search posts
          <input
            key={currentQuery.search}
            ref={searchInputRef}
            defaultValue={currentQuery.search}
            maxLength={50}
            name="search"
            type="search"
            placeholder="Post title or author"
            className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 py-2 text-base font-normal text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="order-2 flex min-h-11 gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search aria-hidden="true" size={18} />
            Search
          </button>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFeed}
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw aria-hidden="true" size={18} />
              Reset
            </button>
          ) : null}
        </div>
      </form>

      {isPending ? (
        <p className="mt-3 text-sm font-medium text-accent">
          Updating feed...
        </p>
      ) : null}
    </section>
  );
}
