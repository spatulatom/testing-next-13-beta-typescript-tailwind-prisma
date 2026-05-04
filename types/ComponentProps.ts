import type { Post as PrismaPost, User } from '@prisma/client';

/**
 * Shared component prop types to avoid duplication and naming conflicts
 */

// Post display component
export interface PostCardProps {
  id: PrismaPost['id'];
  date: PrismaPost['createdAt'];
  name: User['name'];
  avatar: User['image'];
  postTitle: PrismaPost['title'];
  comments: number; // Computed value
}

// Add comment component
export type AddCommentProps = {
  id: string;
};

// User profile display in navigation
export type LoggedUserProps = {
  image: string;
};

// Delete/Edit post component
export type DeletePostProps = {
  id: string;
  avatar: string | null;
  name: string | null;
  title: string;
  comments: Array<{
    id: string;
    title: string;
    createdAt?: Date | string;
    userId: string;
    postId: string;
    user?: {
      id: string;
      image: string | null;
      name: string | null;
      email: string | null;
    };
  }>;
};

// Toggle component (Modal for delete confirmation)
export type ToggleProps = {
  deletePost: () => void;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
};

// Counter component
export type CounterProps = {
  count: number;
};

// Hamburger menu component
export type HamburgerMenuProps = {
  isLoggedIn: boolean;
};
