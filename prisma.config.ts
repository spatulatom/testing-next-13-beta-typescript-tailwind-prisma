import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prisma ORM v7: Prisma CLI (migrate, db push, studio, etc.) reads the URL from here.
    // Prefer a direct (non-pooling) URL for migrations if you have one.
    url:
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.POSTGRES_PRISMA_URL ??
      process.env.DATABASE_URL ??
      '',
  },
});
