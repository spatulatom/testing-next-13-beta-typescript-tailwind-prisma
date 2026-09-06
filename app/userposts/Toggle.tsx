'use client';

import type { ToggleProps } from '@/types/ComponentProps';

export default function Toggle({ deletePost, setToggle }: ToggleProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setToggle(false);
      }}
      className="fixed top-0 left-0 z-20 h-full w-full bg-black/60 backdrop-blur-sm"
    >
      <div className="absolute top-1/2 left-1/2 flex w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 transform flex-col gap-6 rounded-xl border border-border bg-surface p-8 shadow-xl">
        <h2 className="text-center text-xl font-semibold text-foreground">
          Are you sure you want to delete this post? 😥
        </h2>
        <h3 className="text-sm text-danger">
          Pressing the delete button will permenantly delete your post and its
          comments
        </h3>
        <button
          onClick={deletePost}
          className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-danger-foreground transition-opacity hover:opacity-90"
        >
          Delete Post
        </button>
      </div>
    </div>
  );
}
