import { Prisma } from '@prisma/client';

// Post with user and comments (each comment includes the user who made it)
export type PostType = Prisma.PostGetPayload<{
  include: {
    user: true;
    comments: {
      include: {
        user: true;
      };
    };
  };
}>;
