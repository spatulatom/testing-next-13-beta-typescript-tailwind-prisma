'use client';

interface Issue {
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED';
  created_at: string;
  comments: number;
  body: string;
  user: {
    login: string;
  };
}

export function IssueCard({ issue }: { issue: Issue }) {
  const isOpen = issue.state === 'OPEN';
  const createdDate = new Date(issue.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
          #{issue.number}: {issue.title}
        </h3>
        <span
          className={`ml-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            isOpen
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {isOpen ? '🟢 Open' : '🔴 Closed'}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {issue.body}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>👤 {issue.user.login}</span>
        <span>📅 {createdDate}</span>
        <span>💬 {issue.comments} comments</span>
      </div>
    </div>
  );
}
