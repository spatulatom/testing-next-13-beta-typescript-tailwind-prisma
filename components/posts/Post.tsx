import Image from 'next/image';
import Link from 'next/link';
// import { motion } from 'framer-motion';
import type { PostCardProps } from '@/types/ComponentProps';
import HeartButton from '@/components/posts/HeartButton';

export default function Post({
  id,
  date,
  name,
  avatar,
  postTitle,
  comments,
  hearts,
  heartedByCurrentUser,
  canToggleHeart,
}: PostCardProps) {
  let whenNull;
  if (avatar === null) {
    whenNull = (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-muted-foreground">
        {name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
    );
  } else {
    whenNull = (
      <Image
        className="rounded-full"
        width={36}
        height={36}
        src={avatar}
        alt="avatar"
      />
    );
  }
  // void cookies();
  const d = new Date(date).toLocaleString().toString();

  console.log(
    'POSTTTTTTTT',
    date,
    typeof date,
    date instanceof Date
    // d.toLocaleString()
  );
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:border-accent/40 hover:shadow-md">
      <Link
        href={{
          pathname: `/${id}`,
        }}
        prefetch={false}
        className="block"
      >
        <div className="flex items-center gap-3 px-4 pt-4">
          {whenNull}
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <h4 className="text-xs text-muted-foreground">posted on {d}</h4>
          </div>
        </div>
        <p className="px-4 py-4 text-base leading-relaxed text-foreground">
          {postTitle}
        </p>
        <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-sm text-muted-foreground">
          <span>
            {comments} {comments === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </Link>
      <HeartButton
        postId={id}
        initialCount={hearts}
        initialHearted={heartedByCurrentUser}
        canHeart={canToggleHeart}
      />
    </div>
  );
}
