import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  buildFeedHref,
  DEFAULT_FEED_PAGE,
  type FeedPaginationMeta,
  type FeedQuery,
} from '@/lib/posts/feed-query';

type FeedPaginationProps = {
  currentQuery: FeedQuery;
  pagination: FeedPaginationMeta;
};

export default function FeedPagination({
  currentQuery,
  pagination,
}: FeedPaginationProps) {
  if (pagination.totalPages <= DEFAULT_FEED_PAGE) {
    return null;
  }

  const previousHref = buildFeedHref(currentQuery, pagination.currentPage - 1);
  const nextHref = buildFeedHref(currentQuery, pagination.currentPage + 1);
  const controlClassName =
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold';
  const enabledClassName = `${controlClassName} bg-teal-600 text-white hover:bg-teal-700 focus:bg-teal-700`;
  const disabledClassName = `${controlClassName} cursor-not-allowed bg-gray-200 text-gray-500`;

  return (
    <nav
      aria-label="Feed pagination"
      className="my-6 flex flex-wrap items-center justify-center gap-3"
    >
      {pagination.hasPreviousPage ? (
        <Link className={enabledClassName} href={previousHref}>
          <ChevronLeft aria-hidden="true" size={18} />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClassName}>
          <ChevronLeft aria-hidden="true" size={18} />
          Previous
        </span>
      )}

      <span className="min-h-11 rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-800">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>

      {pagination.hasNextPage ? (
        <Link className={enabledClassName} href={nextHref}>
          Next
          <ChevronRight aria-hidden="true" size={18} />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClassName}>
          Next
          <ChevronRight aria-hidden="true" size={18} />
        </span>
      )}
    </nav>
  );
}
