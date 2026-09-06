import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-8 text-center">
      <h2 className="text-2xl font-bold text-foreground">Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Could not find requested resource
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        Return Home
      </Link>
    </div>
  );
}
