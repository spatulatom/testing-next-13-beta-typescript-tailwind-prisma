export default function NotFound() {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          Could not find requested resource
        </p>
      </div>
    );
  }