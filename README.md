This is a [Next.js 13 beta](https://beta.nextjs.org/docs/getting-started) project bootstrapped with [`npx create-next-app@latest`](https://beta.nextjs.org/docs/installation). The app is called 'Chat room'. 

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
    <li><a href="#about-the-project">About The Project</a></li>
      <li><a href="#sidenote">Sidenote</a></li>
    <li><a href="#mutating-data">Mutating Data with new Server Components</a></li>
    <li><a href="#backend">Backend an new Route Handlers</a></li>
       <li><a href="#error-handling-and-loading-ui">Error handling and Loading UI</a></li>
     <li><a href="#new-features">Other new features used in the app</a></li>
      <li><a href="#typescript">TypeScript</a></li>
    <li><a href="#built-with">Built With</a></li>
     <li><a href="#getting-started">Getting Started</a></li>
   
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project
This project explores many different features introduced by the Next.js 13 Beta update, some of them features are not recommended for full scale production just yet, as this version of Next.js is still being developed and worked on.

## SideNote:
The project was built a few months ago, around the middle of 2023. Since then, the Beta version of Next has transitioned to full production, and numerous features tested in this app have been recognized and incorporated by Next.js. These improvements include enhancements to data mutation processes, among others. Notably, as of October 26th, Next.js 14 has been released.
</br>
 I called it a 'Chat room', it isa  fullstack CRUD app, it consists of the frontend and the backend sections. Lines between frontend/backend in case of Next.js 13 Beta are blurred with introduction of server components, yet files that are strictly 'backend'
    can be found in pages/api and in app/api. As for the frontend I am using the new app directory with new server components in it.
       <br />
   
     
The app has three main functionalities allowing users to:
- login in with your Google account through NextAuth.js,
- CREATE a post, 
- CREATE a comment, 
- DELETE a post (with comments).  

![Product Name Screen Shot](public/next13beta.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Mutating Data

 The aproach  nr 1 described below is <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>temporarly recommended by Next.js </a> team until a better one is developed.
 </br>

1. CREATING a post && ADDING a comment are built with a combination of
- <a href = 'https://beta.nextjs.org/docs/rendering/server-and-client-components'>new server components</a> and client components
-  <a href='https://beta.nextjs.org/docs/data-fetching/fetching#asyncawait-in-server-components'>async/await sytnax wrapping  those server componets </a> (new approach not allowed in previous versions of Next.js or in React.js),
-  <a href ='https://beta.nextjs.org/docs/data-fetching/fetching'>  new fetch() API</a> in those server components that allows configuration for SSG (static site generation) and SSR (server side rendering) - NO NEED for extra functions like getStaticProps or getServerSideProps,
-  <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>new useRouter Hook </a> imported from next/navigation (not form next/router like up until now) and a new router.refresh()  method on it.


REVIEW: This app has many components thats use fetched data, some of those components only display that data, other components are mutating that data. There is no globally managed state that would hold that fetched data (like it usually happens in apps built with 'pure' React.js) instead each componets that uses the data fetches it directly from the databse or uses <a href='https://beta.nextjs.org/docs/data-fetching/caching'>default built in caching</a> and grabs the data from the cache. 
</br> </br>
The problem is that we DONT KNOW when Next.js should use catch storage for getting the data or when it should freshy fetch the data from the database, as there is NO COMMUNICATION BETWEEN COMPONETS in the app on that matter. When one component mutates the data - let's say deletes an item, other componets DON NOT KNOW  about it, so when they are in use, they need to fetch fresh data from the database JUST IN CASE the data was possibly mutated somewhere in the app,  even though very often grabbing data from the cache storage would be completly sufficient.  
</br>
For that reason we can not obviously use SSG (and fetch data only at a built time in this app), (we have to use SSR instead),  but more importantly we have to perform A LOT of data fetching. When we click links in navigation whenever those 'clicked' componets use data, they need to perform a fresh data fetch. By default in Next.js navigation is <a href='https://beta.nextjs.org/docs/data-fetching/caching'>soft </a>- it makes components use catching storage, so we need to modify it and make it a, so called, <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#hard-navigation'>hard navigation</a> to make sure data is grabbed not from the catche but fetched from database every time. That makes navigation between componets  that use fetched data obviously much slower.


2. DELETING  a post (with comments) is built for contrast with 
- client components, 
- Axios for data fetching,
-  <a href='https://tanstack.com/query/v3/'>React Query for mutating data.</a> 


REVIEW: 
React Query HAS A WAY OF COMMUNICATING BETWEEN COMPONETS whether there was a data mutation in the app. If that's the case it performs a fresh data fetch, OTHERWISE it uses data stored in the catch. React Query KNOWS EXACTLY IF DATA WAS MUTATED in the app.
</br>Since we can leave all those fetching 'decisions' to React Query, we can go back to a default <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#conditions-for-soft-navigation'>soft navigation</a> between components in our app.
</br>
For those reasons mentioned above (until Next.js team finds a better way to mutate data in server components) using React Query gives a much smoother user experience.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Backend
- Next.js 13 beta introduces <a href='https://beta.nextjs.org/docs/routing/route-handlers'>Route Handlers </a>, they can only be used inside of the new app directory in <strong>app/api </strong>as a replacement for <a href='https://beta.nextjs.org/docs/data-fetching/api-routes'>API routes </a> only used in <strong>pages/api</strong>
- for most of the API routes in this app I am using new approach placing the routes in the new app directory in <strong>app/api </strong>
- <a href='https://next-auth.js.org/getting-started/example'>but since NextAuth.js doesn't yet support new directory convention</a> all routes related to authentication will still have to be placed in <strong>pages/api</strong>

- <a href='https://beta.nextjs.org/docs/routing/defining-routes#route-groups'>Route Groups</a> - new approach can be used for both front/backend routes, 
I am only using it on the backend, for example, in <strong>app/api/(homepage)/...</strong>



<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Error Handling and Loading UI
For error handling in server components I have implemented:
- <a href='https://beta.nextjs.org/docs/routing/error-handling'>new error.tsx file</a> </br>
For handling loading state in server components we have implemented:
- <a href='https://beta.nextjs.org/docs/routing/loading-ui'>new loading.tsx file</a> </br>
( For error handling and loading UI on the clint side we are using:
- <a href='https://react-hot-toast.com/'>React Hot Toast</a>)



<p align="right">(<a href="#readme-top">back to top</a>)</p>

## New Features
As for other new features introduced in Next.js 13 I have implemented:

- New next/image: Faster with native browser lazy loading in <strong>app/Logged.tsx</strong>
- new @next/font: Automatic self-hosted fonts with zero layout shift in <strong>app/page.tsx</strong>
- new next/link : Simplified API with automatic in <strong>app/Nav.tsx</strong>


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## TypeScript
[`npx create-next-app@latest`](https://beta.nextjs.org/docs/installation)  now ships with TypeScript by default. See ['TypeScript'](https://beta.nextjs.org/docs/configuring/typescript) for more information.
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
