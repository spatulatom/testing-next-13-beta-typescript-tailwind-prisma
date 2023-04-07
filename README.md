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
I am trying in this project many different features introduced by the Next.js team, some of them are not recommended for production just yet as Next.js version 13 beta is still being developed and worked on. 
</br>
 'Chat room' is a fullstack CRUD app, it consists of the frontend and the backend sections. Lines between frontend/backend in case of Next.js 13 beta are blurred with introduction server components yet files that are strictly 'backend'
    can be found in pages/api and in app/api. As for the frontend I am using new app directory with new server components in it.
       <br />
   
     
The app has three main functionalities allowing users to:
- CREATE a post, 
- ADD a comment, 
- DELETE a post (with comments).  
Users can log into the app using their Google accounts (NextAuth.js)

![Product Name Screen Shot](public/next13beta.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Mutating Data

 The aproach described below is <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>temporarly recommended by Next.js </a> team until a better one is developed.
 </br>

1. CREATING a post && ADDING a comment are built with a combination of
- <a href = 'https://beta.nextjs.org/docs/rendering/server-and-client-components'>new server components</a> and client components
-  <a href='https://beta.nextjs.org/docs/data-fetching/fetching#asyncawait-in-server-components'>async/await sytnax in those server componets </a> (new approach not allowed in previous versions of Next.js or in React.js) and <a href ='https://beta.nextjs.org/docs/data-fetching/fetching'>  new fetch() API</a> that allows configuration for SSG (static site generation) and SSR (server side rendering) - NO NEED for extra functions like getStaticProps or getServerSideProps,
-  <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>new useRouter Hook </a> imported from next/navigation (not form next/router like up until now) and a new router.refresh()  method on it.


REVIEW: Given the dynamic nature of this app we CAN NOT use in this approach SSG (and fetch the data ONLY AT BUILT TIME) as we need to fetch fresh data every time data is mutated somewhere in the app, therefore we use SSR. The DOWNSIDE of that approach is that we have NO WAY OF KNOWING WHEN DATA GOT MUTATED in the app, why? Because there is no globallly managed data (state) - data is fetched direclty to each components that needs it. Therefore every time we go to a page that uses data - just in case the data was mutated somwhere in the app we need to use <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#hard-navigation'>hard navigation</a> and not use a <a href='https://beta.nextjs.org/docs/data-fetching/caching'>default in built caching</a> and perform SSG - router.refresh() is used for it as it triggers SSG.

2. DELETING  a post (with comments) is built for contrast with client components, Axios for data fetching and <a href='https://tanstack.com/query/v3/'>React Query for mutating data.</a> React Query has a way of comunicating between components whether there was a mutation and therfore a need for a fresh data fetch or whether cached data is ok to be used.

REVIEW: In this approach when using React Query  WE KNOW EXACTLY WHEN DATA WAS MUTATED in the app so only then we perform a fresh data fetch, otherwise WE CAN USE DATA STORED IN THE CACHE and (and perform only <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#conditions-for-soft-navigation'>soft navigation</a>).  

OPINION: For those reasons mentioned above (until Next.js team finds a better way to mutate data in server components) using React Query gives a much smoother user experience.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Backend
- Next.js 13 beta introduces <a href='https://beta.nextjs.org/docs/routing/route-handlers'>Route Handlers </a>( they can only be used inside of the app directory in app/api ) as a replacement for <a href='https://beta.nextjs.org/docs/data-fetching/api-routes'>API routes (only used in pages/api)</a>
- <a href='https://next-auth.js.org/getting-started/example'>NextAuth.js doesn't yet support new app/api directory so routes related to authentication will still have to be placed in pages/api</a>
- As for the rest of the API routes in this app I am using new approach placing the routes in the new app directory.
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
- Tailwind CSS for styling
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
