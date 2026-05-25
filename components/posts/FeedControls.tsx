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
    <section className="mb-4 rounded-md bg-white p-4 text-gray-900">
      <form onSubmit={submitSearch} className="grid gap-3">
        <label className="order-1 flex flex-col gap-1 text-sm font-bold text-gray-700">
          Search posts
          <input
            key={currentQuery.search}
            ref={searchInputRef}
            defaultValue={currentQuery.search}
            maxLength={50}
            name="search"
            type="search"
            placeholder="Post title or author"
            className="min-h-11 rounded-md bg-gray-200 px-3 py-2 text-base font-normal text-black outline-teal-600"
          />
        </label>

        <div className="order-2 flex min-h-11 gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 focus:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search aria-hidden="true" size={18} />
            Search
          </button>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFeed}
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-300 focus:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw aria-hidden="true" size={18} />
              Reset
            </button>
          ) : null}
        </div>
      </form>

      {isPending ? (
        <p className="mt-3 text-sm font-medium text-teal-700">
          Updating feed...
        </p>
      ) : null}
    </section>
  );
}
