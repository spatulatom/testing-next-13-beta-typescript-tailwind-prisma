# Chat Room - Updated for Next.js 15 and Beyond

[View the Updated Deployed App on Vercel](#)

## Table of Contents

- [About the Project](#about-the-project)
- [New Features in Next.js 15](#new-features-in-nextjs-15)
- [Detailed Upgrade Examples](#detailed-upgrade-examples)
- [Backend](#backend)
- [Authentication](#authentication)
- [Error Handling and UI Loading](#error-handling-and-ui-loading)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Legacy](#legacy)

## About the Project

'Chat Room' has been updated to leverage the latest features from Next.js 15. This project now:

- Fully integrates with the latest TanStack Query for smoother data fetching and caching.
- Adopts new features introduced in Next.js 15 for improved performance and developer experience.

## New Features in Next.js 15

- **Enhanced Server Actions**: Further improvements in data mutation and server-side logic.
- **Streaming Updates**: Real-time updates with server-side streaming capabilities.
- **Improved Middleware**: Simplified and more powerful middleware for handling requests.

## Upgrade Highlights

### Upgrade from Next.js 14 to 15

- Adopted new server-side streaming features for real-time updates.
- Improved middleware handling for better request management.

### Upgrade from React Query to TanStack Query

- Migrated from React Query to TanStack Query (v5.68.0) for enhanced caching and data synchronization.
- Leveraged TanStack Query's improved API for better developer experience and performance.

### Other Upgrades

- Updated Prisma to version 5.9.1 for compatibility with the latest PostgreSQL connection methods.
- Upgraded NextAuth.js to version 5.0.0-beta.25 for better integration with the App Router.
- Adopted the latest version of Tailwind CSS (v3.2.7) for styling improvements.

_Add more details here based on what you've implemented or improved._

## Detailed Upgrade Examples

### Upgrade from Next.js 14 to 15

#### Server Components and Data Fetching

**Before (Next.js 14):**

```tsx
// In a server component
export default async function PostList() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'no-store',
  }).then((res) => res.json());

  return (
    <div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
```

**After (Next.js 15):**

```tsx
// In a server component
export default async function PostList() {
  // Using the new parallel data fetching pattern
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // New revalidation API
  }).then((res) => res.json());

  return (
    <div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### Server Actions

**Before (Next.js 14):**

```tsx
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  await prisma.post.create({
    data: { title, content },
  });

  revalidatePath('/posts');
}
```

**After (Next.js 15):**

```tsx
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // Enhanced error handling in Server Actions
  try {
    await prisma.post.create({
      data: { title, content },
    });

    revalidatePath('/posts');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to create post' };
  }
}
```

### Upgrade from React Query to TanStack Query

#### Data Fetching

**Before (React Query v3):**

```tsx
import { useQuery } from 'react-query';

function PostsList() {
  const { data, isLoading } = useQuery('posts', fetchPosts);

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**After (TanStack Query v5):**

```tsx
import { useQuery } from '@tanstack/react-query';

function PostsList() {
  // New improved API with type safety
  const { data, isPending } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isPending) return <div>Loading...</div>;

  return <ul>{data?.map((post) => <li key={post.id}>{post.title}</li>)}</ul>;
}
```

#### Data Mutations

**Before (React Query v3):**

```tsx
import { useMutation, useQueryClient } from 'react-query';

function CreatePost() {
  const queryClient = useQueryClient();
  const mutation = useMutation(createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts');
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ title: 'New Post', content: 'Content' });
      }}
    >
      <button type="submit">Create Post</button>
    </form>
  );
}
```

**After (TanStack Query v5):**

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreatePost() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ title: 'New Post', content: 'Content' });
      }}
    >
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### NextAuth.js Upgrade

**Before (NextAuth.js v4):**

```tsx
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
```

**After (NextAuth.js v5):**

```tsx
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});

export const GET = handlers.GET;
export const POST = handlers.POST;
```

### React 18 to React 19 Upgrade

**Before (React 18):**

```tsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**After (React 19):**

```tsx
import { useState, useEffect } from 'react';
import { useDocumentTitle } from 'react/use-document';

function Counter() {
  const [count, setCount] = useState(0);

  // Using the new useDocumentTitle hook from React 19
  useDocumentTitle(`Count: ${count}`);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Other Upgrades

#### Prisma Connection (Before - 2023)

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
```

#### Prisma Connection (After - 2024 with Supavisor)

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_SUPAVISOR, // Using Supavisor connection pooler
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Backend

- **Route Handlers**: Now fully stable, enhancing API route management.
- **Database**: Continued use of Prisma with PostgreSQL on Supabase, now with the latest connection methods.

## Authentication

- **NextAuth.js**: Fully compatible with the new App Router, simplifying authentication flows.

## Error Handling and UI Loading

- **Error Boundary**: Utilized `error.tsx` for better error management.
- **Suspense for Loading**: Improved user experience with `loading.tsx`.

## Built With

- Next.js 15
- TypeScript
- Tailwind CSS, CSS Modules
- Prisma, PostgreSQL
- TanStack Query
- [List other tools or libraries you've added or changed]

_(Below we have a legacy Readme before the project got updated to Next.js 14.)_

## LEGACY README WHEN THE PROJECT WAS USING NEXT.JS VERSION NUMBER 13:

This is a Next.js 13 Beta project integrated with TypeScript, styled with combination of <a href='https://tailwindcss.com/'>Tailwind CSS</a> and CSS modules. The application is named 'Chat Room'.
<a name="readme-top"></a>

<div align="left">
<p>
   <a href="https://testing-next-13-beta-typescript-tailwind-prisma.vercel.app/"><strong>View the deployed app on Vercel »</strong></a>
    <br />
        <br />
   
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
  <li><a href="#next-13-beta-and-later-versions">Next.js 13 Beta and later versions</a></li>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#mutating-data">Mutating Data with new Server Components</a></li>
    <li><a href="#backend">Backend an new Route Handlers</a></li>
       <li><a href="#error-handling-and-loading-ui">Error handling and Loading UI</a></li>
         <li><a href="#authentication">Authentication with NextAuth.js</a></li>
     <li><a href="#new-features">Other new features used in the app</a></li>
      <li><a href="#typescript">TypeScript</a></li>
    <li><a href="#built-with">Built With</a></li>
     <li><a href="#getting-started">Getting Started</a></li>
   
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## Next 13 Beta and later versions:

The project was built a few months ago, around the middle of 2023. Since then, the Beta version of Next.js 13 has transitioned to full production, and numerous features tested in this app have been recognized and incorporated by Next.js. These improvements include enhancements to data mutation processes, among others. Notably, as of October 26th, Next.js 14 has been released.

## About The Project

This project explores many different features introduced by the Next.js 13 Beta update. Some of these features were not recommended for full-scale production just yet (when the app was built in 2023), as this version of Next.js is still being developed and worked on.

'Chat room' is a fullstack CRUD app, consisting of the frontend and the backend sections. Lines between frontend/backend in the case of Next.js 13 Beta are blurred with the introduction of server components, yet files that are strictly 'backend' can be found in pages/api and in app/api. As for the frontend, I am using the new app directory with new server components in it.
<br />

The app has three main functionalities allowing users to:

- login in with your Google account through NextAuth.js,
- CREATE a post,
- CREATE a comment,
- DELETE a post (with comments).

![Product Name Screen Shot](public/next13beta.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Mutating Data

The aproach nr 1 described below is <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>temporarly recommended by Next.js </a> team until a better one is developed.
</br>

1. CREATING a post && ADDING a comment are built with a combination of

- <a href = 'https://beta.nextjs.org/docs/rendering/server-and-client-components'>SERVER components</a>
- <a href='https://beta.nextjs.org/docs/data-fetching/fetching#asyncawait-in-server-components'>async/await sytnax wrapping those server componets </a> (new approach not allowed in previous versions of Next.js or in React.js),
- <a href ='https://beta.nextjs.org/docs/data-fetching/fetching'> new fetch() API</a> in those server components that allows configuration for SSG (static site generation) and SSR (server side rendering) - NO NEED for extra functions like getStaticProps or getServerSideProps,
- <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>new useRouter Hook </a> imported from next/navigation (not form next/router like up until now) and a new router.refresh() method on it.

REVIEW: This app has many components thats use fetched data, some of those components only display that data, other components are mutating that data. There is no globally managed state that would hold that fetched data (like it usually happens in apps built with 'pure' React.js) instead each componets that uses the data fetches it directly from the databse or uses <a href='https://beta.nextjs.org/docs/data-fetching/caching'>default built in caching</a> and grabs the data from the cache.
</br> </br>
The problem is that we DONT KNOW when Next.js should use catch storage for getting the data or when it should freshy fetch the data from the database, as there is NO COMMUNICATION BETWEEN SERVER COMPONETS in the app on that matter. When one component mutates the data - let's say deletes an item, other componets DOES NOT KNOW about it, so when those other components are renderede, they need to fetch fresh data from the database JUST IN CASE the data was possibly mutated somewhere in the app, even though very often grabbing data from the cache storage would be completly sufficient.  
</br>
For that reason we can not obviously use SSG (and fetch data only at a built time in this app), (we have to use SSR instead), but more importantly we have to perform A LOT of data fetching. When we click links in navigation whenever those 'clicked' componets use data, they need to perform a fresh data fetch. By default in Next.js navigation is <a href='https://beta.nextjs.org/docs/data-fetching/caching'>soft </a>- it makes components use catching storage, so we need to modify it and make it a, so called, <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#hard-navigation'>hard navigation</a> to make sure data is grabbed not from the catche but fetched from database every time (this is where the useRouter refresh() method comes into play). That makes navigation between componets that use fetched data obviously much slower but ensures that every navigated page-to has a freshly feteched data.

2. DELETING  a post (with comments) is built for contrast with

- client components,
- Axios for data fetching,
- <a href='https://tanstack.com/query/v3/'>React Query for mutating data.</a>

REVIEW:
React Query HAS A WAY OF COMMUNICATING BETWEEN COMPONETS whether there was a data mutation in the app. If that's the case it performs a fresh data fetch, OTHERWISE it uses data stored in the catch. React Query KNOWS EXACTLY IF DATA WAS MUTATED in the app.
</br>Since we can leave all those fetching 'decisions' to React Query, we can go back to a default <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#conditions-for-soft-navigation'>soft navigation</a> between components in our app.
</br>
For those reasons mentioned above (until Next.js team finds a better way to mutate data in server components) using React Query gives a much smoother user experience.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Backend

- Next.js 13 beta introduces <a href='https://beta.nextjs.org/docs/routing/route-handlers'>Route Handlers </a>, they can only be used inside of the new app directory in <strong>app/api </strong>as a replacement for <a href='https://beta.nextjs.org/docs/data-fetching/api-routes'>API routes </a> only used in <strong>pages/api</strong>
- for most of the API routes in this app I am using new approach placing the routes in the new app directory in <strong>app/api </strong>

- <a href='https://beta.nextjs.org/docs/routing/defining-routes#route-groups'>Route Groups</a> - new approach can be used for both front/backend routes,
  I am only using it on the backend, for example, in <strong>app/api/(homepage)/...</strong>

- <a href='https://www.prisma.io/'>Prisma</a> is used for data modeling and data is stored as PostgreSQL on <a href='https://supabase.com/'>Supabase</a>. The connection to Supabase is through Supavisor, a scalable, cloud-native Postgres connection pooler developed by Supabase (only available since January 2024 - before the connection was through PGBouncer, which together with IPv4 protocols connections got deprecated on Supabase as of the end of Jan 2024)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Error Handling and Loading UI

For error handling in server components I have implemented:

- <a href='https://beta.nextjs.org/docs/routing/error-handling'>new error.tsx file</a> </br>
  For handling loading state in server components we have implemented:
- <a href='https://beta.nextjs.org/docs/routing/loading-ui'>new loading.tsx file</a> </br>
  ( For error handling and loading UI on the clint side we are using:
- <a href='https://react-hot-toast.com/'>React Hot Toast</a>)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Authentication

- <a href='https://next-auth.js.org/'>NextAuth.js</a> is used for user authentication through their Google accounts. At the point the app was being built, NextAuth.js was not
supported in Next.js 13 Beta that is using the new App directory, and for that only reason in this app I also use the pages folder (that up until
now was the main folder for component composition and routing). Therefore this app is a hybrid between two ways of files structuring
in Next.js: uses experimental App directory for everything else, and all routes related to authentication are still being placed in <strong>pages/api folder</strong>

  <p align="right">(<a href="#readme-top">back to top</a>)</p>

## New Features

As for other new features introduced in Next.js 13 I have implemented:

- New next/image: Faster with native browser lazy loading in <strong>app/Logged.tsx</strong>
- new @next/font: Automatic self-hosted fonts with zero layout shift in <strong>app/page.tsx</strong>
- new next/link : Simplified API with automatic in <strong>app/Nav.tsx</strong>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## TypeScript

[`npx create-next-app@latest`](https://beta.nextjs.org/docs/installation) now ships with TypeScript by default. See ['TypeScript'](https://beta.nextjs.org/docs/configuring/typescript) for more information.
While implementing TypeScript into Next 13 beta I have been following these guidlines:

- <a href='https://nextjs.org/docs/basic-features/typescript'>TypeSript for Next.js </a> (BEFORE version 13 beta),
- TypeScript for new Next.js 13 beta features: <a href='https://beta.nextjs.org/docs/configuring/typescript'> here </a> and <a href='https://beta.nextjs.org/docs/routing/route-handlers#extended-nextrequest-and-nextresponse-apis'> here regarding new backend Route Handlers</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- <a href='https://beta.nextjs.org/docs/getting-started'>Next.js 13 beta</a>,
- TypeScript,
- Tailwind CSS - for majority of styling,
  CSS modules - fading background of Next.js 13 logo,
- <a href='https://tanstack.com/query/v3/'>React Query</a>
- <a href='https://react-hot-toast.com/'>React Hot Toast</a> for notifications,
- NextAuth.js for users authentificaton,
- for data modeling and storage <a href='https://www.prisma.io/'>Prisma</a> && <a href='https://www.postgresql.org/'>PostgreSQL</a> stored in <a href='https://supabase.com/'>supabase</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/tomasz-s-069249244/
[product-screenshot]: images/screenshot.png
[next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[next-url]: https://nextjs.org/
[react.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[vue-url]: https://vuejs.org/
[angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[angular-url]: https://angular.io/
[svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[svelte-url]: https://svelte.dev/
[laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[laravel-url]: https://laravel.com
[bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[bootstrap-url]: https://getbootstrap.com
[jquery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[jquery-url]: https://jquery.com
