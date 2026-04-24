import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About the Chat Room project — a Next.js exploration app tracking the evolution of the framework from v13 Beta to v16+.',
};

const techStack = [
  { name: 'Next.js (App Router)', description: 'Server components, streaming, caching, and server actions across versions 13 → 16+.' },
  { name: 'TypeScript', description: 'Fully typed codebase for safer refactoring and better IDE support.' },
  { name: 'Tailwind CSS', description: 'Utility-first styling, migrated from v3 config to the v4 CSS-first approach.' },
  { name: 'Prisma + PostgreSQL', description: 'ORM for type-safe database access against a hosted PostgreSQL instance.' },
  { name: 'NextAuth.js / Auth.js v5', description: 'OAuth authentication (Google) integrated with the App Router.' },
  { name: 'TanStack Query v5', description: 'Client-side data fetching and cache invalidation alongside React Server Components.' },
];

const milestones: { version: string; highlight: ReactNode }[] = [
  { version: 'Next.js 13 Beta', highlight: 'First exploration of the App Router and React Server Components (RSC).' },
  { version: 'Next.js 14', highlight: 'Adopted server actions for mutations and removed the old pages-based API routes.' },
  { version: 'Next.js 15', highlight: <>Leveraged the new <code className="rounded bg-gray-700 px-1 text-xs">unstable_cache</code> / <code className="rounded bg-gray-700 px-1 text-xs">use cache</code> directive and improved streaming.</> },
  { version: 'Next.js 16+', highlight: 'Testing Cached Components, updated caching APIs, and Turbopack dev server.' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-10">
      {/* Hero */}
      <section className="space-y-3 text-center">
        <h1 className="bg-linear-to-r from-teal-600 via-black to-white bg-clip-text text-4xl font-bold">
          About Chat Room
        </h1>
        <p className="text-lg text-gray-400">
          A living lab for Next.js — from the very first App Router beta to the
          latest cutting-edge releases.
        </p>
      </section>

      {/* What is this project */}
      <section className="space-y-3 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-teal-500">What is this project?</h2>
        <p className="leading-relaxed text-gray-300">
          <strong>Chat Room</strong> is a full-stack CRUD application that was
          born in <strong>2023</strong> as a test-bed for the Next.js 13 Beta App
          Router. Users can sign in with Google, create posts, and leave
          comments — a simple enough domain to keep the focus on the{' '}
          <em>framework</em> rather than the business logic.
        </p>
        <p className="leading-relaxed text-gray-300">
          Every time Next.js ships a major version, this project is upgraded and
          the new APIs are exercised — making it a hands-on changelog of
          real-world Next.js evolution.
        </p>
      </section>

      {/* Tech stack */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-teal-500">Tech Stack</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {techStack.map(({ name, description }) => (
            <li
              key={name}
              className="rounded-xl border border-gray-700 p-4"
            >
              <div className="space-y-1">
                <span className="font-medium text-white">{name}</span>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Version milestones */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-teal-500">Version Milestones</h2>
        <ol className="relative border-l border-gray-700 space-y-6 pl-6">
          {milestones.map(({ version, highlight }) => (
            <li key={version} className="relative">
              <span className="absolute -left-[9px] top-1 h-3 w-3 rounded-full bg-teal-500" />
              <p className="font-medium text-white">{version}</p>
              <p className="mt-1 text-sm text-gray-400">{highlight}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Links */}
      <section className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          ← Back to Chat Room
        </Link>
        <a
          href="https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma#readme"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-teal-500 hover:text-teal-400"
        >
          View README on GitHub ↗
        </a>
      </section>
    </div>
  );
}
