'use client'; // Error components must be Client components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('erroroor', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-8 text-center">
      <h2 className="text-lg font-semibold text-foreground">{error.message}</h2>

      <button
        className="mt-4 rounded-lg bg-danger px-6 py-3 text-sm font-semibold text-danger-foreground transition-colors hover:opacity-90"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
