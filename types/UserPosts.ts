import { Prisma } from '@prisma/client';

// User with posts (posts include comments with nested user data)
export type UserPosts = Prisma.UserGetPayload<{
  include: {
    posts: {
      include: {
        comments: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>;
