import React, { Suspense } from 'react';
import postgres from 'postgres';
import { connection } from 'next/server';
import { cacheLife } from 'next/cache';

// Dynamic database query - FRESH on every request (no caching)
// Use this pattern for real-time data like plane tracking, live scores, etc.
async function FetchTotalUsersCount() {
  'use cache';
  cacheLife('max')
  // Signal to Next.js: "defer this to request time, I need fresh data"
  // await connection();
  
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL!;
  const sql = postgres(connectionString);
  
  // Now the query runs fresh on every request
  const result = await sql`SELECT COUNT(*) as count FROM "User"`;
  const totalUsersCount = Number(result[0].count);
  console.log('DATABASE QUERY SUCCESS (FRESH):', result);
  
  return totalUsersCount;
}

// Component wrapper to display the count (for use with Suspense)
async function UsersCountDisplay() {
  const count = await FetchTotalUsersCount();
  return <>{count}</>;
}


export default async function EditSuggestionsPage() {
 

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Database Query Result */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md rounded-lg bg-white p-4 text-center shadow-md dark:bg-gray-800">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Total Users in Database:{' '}
            <span className="text-blue-600 dark:text-blue-400">
              <Suspense fallback={<span>Loading...</span>}>
                <UsersCountDisplay />
              </Suspense>
            </span>
          </p>
        </div>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="animate-shimmer mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
            Help Us Improve
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Your feedback is valuable. Share your suggestions to make our
            platform better for everyone.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all hover:scale-105 dark:bg-gray-800">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Share Ideas</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your innovative ideas can shape the future of our platform.
            </p>
          </div>

          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all hover:scale-105 dark:bg-gray-800">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Report Issues</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Help us identify and fix issues you've encountered.
            </p>
          </div>

          <div className="transform rounded-xl bg-white p-6 shadow-lg transition-all hover:scale-105 dark:bg-gray-800">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Request Features</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tell us what features would make your experience better.
            </p>
          </div>
        </div>

        {/* Suggestion Form */}
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
          <div className="md:flex">
            <div className="hidden bg-gradient-to-tr from-blue-500 to-purple-600 p-10 text-white md:block md:w-1/2">
              <h3 className="mb-4 text-2xl font-bold">Your Voice Matters</h3>
              <p className="mb-4">
                We're constantly working to improve our platform based on user
                feedback.
              </p>
              <p className="mb-4">
                Every suggestion is valuable and helps us create a better
                experience for everyone.
              </p>

              <div className="mt-8">
                <div className="mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Reviewed by our team</span>
                </div>
                <div className="mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Implemented when possible</span>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Updates shared with community</span>
                </div>
              </div>
            </div>

            <div className="w-full p-8 md:w-1/2">
              <h3 className="mb-6 text-2xl font-bold">
                Submit Your Suggestion
              </h3>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24">
          <h2 className="mb-12 text-center text-3xl font-bold">
            What Our Community Says
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
              <div className="mb-4 flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-blue-600 dark:bg-gray-700">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Jane Doe</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Product Designer
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "I suggested an improved navigation system, and the team
                implemented it within weeks. It made a huge difference in how I
                use the platform daily."
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
              <div className="mb-4 flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-green-600 dark:bg-gray-700">
                  MS
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Mike Smith</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Developer
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The feature I requested for code snippets was implemented
                better than I could have imagined. It shows how much they value
                community input."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
