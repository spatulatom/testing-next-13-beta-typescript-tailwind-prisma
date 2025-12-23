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
    <div className="text-center">
      <h2>{error.message}</h2>

      <button
        className="my-2 rounded-lg bg-red-500 p-6 py-3 transition-none hover:bg-red-800"
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
