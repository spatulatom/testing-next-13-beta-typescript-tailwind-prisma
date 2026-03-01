'use client';

interface IssueFiltersProps {
  issues: Issue[];
}

interface Issue {
  number: number;
  state: 'OPEN' | 'CLOSED';
}

export function IssueFilters({ issues }: IssueFiltersProps) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex gap-2">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          All ({issues.length})
        </button>
        <button className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200">
          Open ({issues.filter((i) => i.state === 'OPEN').length})
        </button>
        <button className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200">
          Closed ({issues.filter((i) => i.state === 'CLOSED').length})
        </button>
      </div>
    </div>
  );
}
