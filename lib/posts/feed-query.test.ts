import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FEED_SORT,
  MAX_FEED_SEARCH_LENGTH,
  buildPostOrderBy,
  buildPostWhere,
  normalizeFeedSearchParams,
} from '@/lib/posts/feed-query';

describe('normalizeFeedSearchParams', () => {
  it('returns default query values when params are missing', () => {
    expect(normalizeFeedSearchParams({})).toEqual({
      search: '',
      sort: DEFAULT_FEED_SORT,
    });
  });

  it('uses the first value for repeated params', () => {
    expect(
      normalizeFeedSearchParams({
        search: ['alice', 'bob'],
        sort: ['oldest', 'most-commented'],
      })
    ).toEqual({
      search: 'alice',
      sort: 'oldest',
    });
  });

  it('sanitizes and trims search input', () => {
    expect(
      normalizeFeedSearchParams({ search: '  <strong>Hello</strong>  ' })
    ).toEqual({
      search: 'Hello',
      sort: DEFAULT_FEED_SORT,
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
    });
  });
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
