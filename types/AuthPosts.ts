import { Prisma } from '@prisma/client';

// User with posts (simpler version, posts without nested user in comments)
export type AuthPosts = Prisma.UserGetPayload<{
  include: {
    posts: {
      include: {
        comments: true;
      };
    };
  };
}>;
