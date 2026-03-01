import { IssueCard } from './components/IssueCard';
import { IssueFilters } from './components/IssueFilters';
import { cacheLife } from 'next/cache';

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
          ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
        },
        next: { revalidate: 3600 },
      }
    );

    // Handle rate limiting
    if (response.status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        console.error('GitHub API rate limit exceeded');
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
    }

    if (!response.ok) {
      console.error('GitHub API error:', response.statusText);
      throw new Error(`GitHub API error: ${response.statusText}`);
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
