import { IssueCard } from './components/IssueCard';
import { IssueFilters } from './components/IssueFilters';

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

async function fetchGitHubIssues(): Promise<Issue[]> {
  'use cache';
  cacheLife('hours');

  try {
    const response = await fetch(
      'https://api.github.com/repos/spatulatom/testing-next-13-beta-typescript-tailwind-prisma/issues?state=all&per_page=100',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.error('GitHub API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch GitHub issues:', error);
    return [];
  }
}

export default async function IssuesPage() {
  const issues = await fetchGitHubIssues();

  if (!issues || issues.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          GitHub Issues
        </h1>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            No issues found or unable to fetch from GitHub.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
          GitHub Issues
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tracking improvements for Next.js 16 modernization
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900 dark:bg-opacity-20">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
          Total Issues: <span className="font-bold">{issues.length}</span> (Open:{' '}
          <span className="font-bold">
            {issues.filter((i) => i.state === 'OPEN').length}
          </span>
          , Closed:{' '}
          <span className="font-bold">
            {issues.filter((i) => i.state === 'CLOSED').length}
          </span>
          )
        </p>
      </div>

      <IssueFilters issues={issues} />

      <div className="grid gap-4">
        {issues.map((issue) => (
          <IssueCard key={issue.number} issue={issue} />
        ))}
      </div>
    </div>
  );
}

function IssueFilters({ issues }: { issues: Issue[] }) {
  'use client';
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
