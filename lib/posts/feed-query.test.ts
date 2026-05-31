import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FEED_PAGE,
  DEFAULT_FEED_SORT,
  FEED_PAGE_SIZE,
  MAX_FEED_SEARCH_LENGTH,
  buildFeedHref,
  buildPostOrderBy,
  buildPostWhere,
  getFeedPaginationMeta,
  normalizeFeedSearchParams,
} from '@/lib/posts/feed-query';

describe('normalizeFeedSearchParams', () => {
  it('returns default query values when params are missing', () => {
    expect(normalizeFeedSearchParams({})).toEqual({
      search: '',
      sort: DEFAULT_FEED_SORT,
      page: DEFAULT_FEED_PAGE,
    });
  });

  it('uses the first value for repeated params', () => {
    expect(
      normalizeFeedSearchParams({
        search: ['alice', 'bob'],
        sort: ['oldest', 'most-commented'],
        page: ['2', '3'],
      })
    ).toEqual({
      search: 'alice',
      sort: 'oldest',
      page: 2,
    });
  });

  it('sanitizes and trims search input', () => {
    expect(
      normalizeFeedSearchParams({ search: '  <strong>Hello</strong>  ' })
    ).toEqual({
      search: 'Hello',
      sort: DEFAULT_FEED_SORT,
      page: DEFAULT_FEED_PAGE,
    });
  });

  it('caps search input length', () => {
    const query = normalizeFeedSearchParams({ search: 'a'.repeat(100) });

    expect(query.search).toHaveLength(MAX_FEED_SEARCH_LENGTH);
  });

  it('falls back to newest for invalid sort values', () => {
    expect(normalizeFeedSearchParams({ sort: 'popular' })).toEqual({
      search: '',
      sort: DEFAULT_FEED_SORT,
      page: DEFAULT_FEED_PAGE,
    });
  });

  it('keeps valid page values with search and sort params', () => {
    expect(
      normalizeFeedSearchParams({
        search: 'alice',
        sort: 'most-commented',
        page: '4',
      })
    ).toEqual({
      search: 'alice',
      sort: 'most-commented',
      page: 4,
    });
  });

  it.each(['', 'abc', '2.5', '0', '-1', '1e3'])(
    'falls back to page 1 for invalid page value %s',
    (page) => {
      expect(normalizeFeedSearchParams({ page })).toEqual({
        search: '',
        sort: DEFAULT_FEED_SORT,
        page: DEFAULT_FEED_PAGE,
      });
    }
  );
});

describe('buildPostWhere', () => {
  it('does not filter when search is empty', () => {
    expect(buildPostWhere('')).toEqual({});
  });

  it('searches title and author name case-insensitively', () => {
    expect(buildPostWhere('alice')).toEqual({
      OR: [
        {
          title: {
            contains: 'alice',
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: 'alice',
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  });
});

describe('buildPostOrderBy', () => {
  it('orders newest posts first by default', () => {
    expect(buildPostOrderBy('newest')).toEqual([
      { createdAt: 'desc' },
      { id: 'asc' },
    ]);
  });

  it('orders oldest posts first', () => {
    expect(buildPostOrderBy('oldest')).toEqual([
      { createdAt: 'asc' },
      { id: 'asc' },
    ]);
  });

  it('orders most commented posts first with stable tie breakers', () => {
    expect(buildPostOrderBy('most-commented')).toEqual([
      { comments: { _count: 'desc' } },
      { createdAt: 'desc' },
      { id: 'asc' },
    ]);
  });
});

describe('getFeedPaginationMeta', () => {
  it('returns first page metadata', () => {
    expect(getFeedPaginationMeta({ requestedPage: 1, totalCount: 8 })).toEqual({
      requestedPage: 1,
      currentPage: 1,
      totalPages: 3,
      totalCount: 8,
      pageSize: FEED_PAGE_SIZE,
      skip: 0,
      hasPreviousPage: false,
      hasNextPage: true,
    });
  });

  it('returns middle page metadata', () => {
    expect(getFeedPaginationMeta({ requestedPage: 2, totalCount: 8 })).toEqual({
      requestedPage: 2,
      currentPage: 2,
      totalPages: 3,
      totalCount: 8,
      pageSize: FEED_PAGE_SIZE,
      skip: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });

  it('returns last page metadata', () => {
    expect(getFeedPaginationMeta({ requestedPage: 3, totalCount: 8 })).toEqual({
      requestedPage: 3,
      currentPage: 3,
      totalPages: 3,
      totalCount: 8,
      pageSize: FEED_PAGE_SIZE,
      skip: 6,
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });

  it('recovers out-of-range pages to the last page', () => {
    expect(getFeedPaginationMeta({ requestedPage: 99, totalCount: 8 })).toEqual(
      {
        requestedPage: 99,
        currentPage: 3,
        totalPages: 3,
        totalCount: 8,
        pageSize: FEED_PAGE_SIZE,
        skip: 6,
        hasPreviousPage: true,
        hasNextPage: false,
      }
    );
  });

  it('uses page 1 metadata for empty result sets', () => {
    expect(getFeedPaginationMeta({ requestedPage: 4, totalCount: 0 })).toEqual({
      requestedPage: 4,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: FEED_PAGE_SIZE,
      skip: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });
});

describe('buildFeedHref', () => {
  it('omits page 1 from the default feed URL', () => {
    expect(
      buildFeedHref(
        { search: '', sort: DEFAULT_FEED_SORT, page: DEFAULT_FEED_PAGE },
        1
      )
    ).toBe('/');
  });

  it('preserves filters while omitting page 1', () => {
    expect(
      buildFeedHref(
        { search: 'alice', sort: 'oldest', page: DEFAULT_FEED_PAGE },
        1
      )
    ).toBe('/?search=alice&sort=oldest');
  });

  it('preserves search and sort when building later page URLs', () => {
    expect(buildFeedHref({ search: 'alice', sort: 'oldest', page: 4 }, 4)).toBe(
      '/?search=alice&sort=oldest&page=4'
    );
  });
});
