'use client';

interface IssueFiltersProps {
  filter: 'all' | 'open' | 'closed';
  sort: 'newest' | 'oldest' | 'comments';
  onFilterChange: (filter: 'all' | 'open' | 'closed') => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'comments') => void;
}

export function IssueFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: IssueFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {(['all', 'open', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as typeof sort)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="comments">Most Comments</option>
      </select>
    </div>
  );
}
