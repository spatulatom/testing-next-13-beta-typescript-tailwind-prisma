This is a [Next.js 13 beta](https://beta.nextjs.org/docs/getting-started) project bootstrapped with [`npx create-next-app@latest`](https://beta.nextjs.org/docs/installation) that now ships with TypeScript by default. See ['TypeScript'](https://beta.nextjs.org/docs/configuring/typescript) for more information. The app is called 'Chat room'

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
    <li><a href="#mutating-data">Mutating Data</a></li>
    <li><a href="#backend">Backend</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
     <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#learn-more">Learn More</a></li>
    <li><a href="#deploy-on-vercel">Deploy on Vercel</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

 'Chat room' is a fullstack CRUD app, it consists of the frontend and the backend sections. Line between frontend/backend in case of Next.js 13 beta is blurred  but files that are strictly 'backend'
    can be found in pages/api and in app/api.
       <br />
   
     
The app has distinct three 'sections' where users can:
- create a post, 
- add a comment, 
- delete a post (with comments).  
Users can log in using their Google accounts (thanks to NextAuth.js)

![Product Name Screen Shot](public/next13beta.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Mutating Data

1. CREATING a post/ADDING a comment are built with a combination of
- <a href = 'https://beta.nextjs.org/docs/rendering/server-and-client-components'>new server components</a> and client components
-  <a href='https://beta.nextjs.org/docs/data-fetching/fetching#asyncawait-in-server-components'>async/await in those server componets (which is completly new approach)</a> and <a href ='https://beta.nextjs.org/docs/data-fetching/fetching'>new fetch() API</a> that allows for SSG (static site generation) and SSR (server side rendering)
-  <a href='https://beta.nextjs.org/docs/data-fetching/mutating'>MUTATING DATA  with useRouter</a> (solution temporarly recommended by Next.js team until a better one is found) imported from next/navigation (not form next/router) and a new router.refresh()  method.

REVIEW: Given the dynamic nature of this app we CAN NOT  use in this approach SSG (and fetch the data ONLY AT BUILT TOME) as we need to fetch fresh data every time data is mutated somewhere in the app, therefore we use SSR. The DOWNSIDE here is that we have NO WAY OF KNOWING WHEN DATA GOT MUTATED so every time we go to a page that uses data (just in case if it  was mutated) we need to use <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#hard-navigation'>hard navigation</a> and perform SSG (and router.refresh() triggers SSG).

2. DELETING  a post (with comments) is built for contrast with client components, Axios for data fetching and <a href='https://tanstack.com/query/v3/'>React Query for mutating data.</a>

REVIEW: In this approach when using React Query  WE KNOW EXACTLY WHEN DATA WAS MUTATED in the app so only then we perform a fresh data fetch, otherwise WE CAN USE DATA STORED IN THE CACHE and (and perform only <a href='https://beta.nextjs.org/docs/routing/linking-and-navigating#conditions-for-soft-navigation'>soft navigation</a>).  

VERDICT: For those reasons mentioned above (until Next.js team finds a better way to mutate data in server components) using React Query gives a much smoother user experience.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Backend
- Next.js 13 beta introduces <a href='https://beta.nextjs.org/docs/routing/route-handlers'>Route Handlers </a>( they can only be used inside of the app directory in app/api ) as a replacement for <a href='https://beta.nextjs.org/docs/data-fetching/api-routes'>API routes </a>(only used in pages/api)
- NextAuth.js doesn't yet support new app/api directory so routes related to authentication will still have to be placed in pages/api
- As for the rest of the API routes in this app we are using new approach placing the routes in the new app directory.
- <a href='https://beta.nextjs.org/docs/routing/defining-routes#route-groups'>Route Groups</a> - new approach can be used for both front/backend routes, 
we are only using it on the backend


<p align="right">(<a href="#readme-top">back to top</a>)</p>





### Built With

- Tailwind,
- JavaScript,
- GitHub pages for deployment and remote repository,
- Git for version control,
- render.com for server deployment,
- fullpage.js library for vertical and horizontal scroll,
- Node.js, Express.js for the backend server,
- MongoDB for contact form data storage,
- SendGrid API for sending emails,
- Visual Studio Code as a local IDE & repository,
- Chrome Developer Tools for testing screen sizes and using Lighthouse,
- Chrome, Firefox, Brave Browser, Edge and Opera for browser testing the responsiveness,
- https://ui.dev/amiresponsive for testing and to make responsive image,
- https://favicon.io/favicon-generator/ to create a favicon,
- https://fontawesome.com/ for icons,
- https://tinypng.com/ to optimize images,
- https://www.remove.bg/ for removing images backgrounds,
- https://chrome.google.com/webstore/detail/pesticide-for-chrome-with/neonnmencpneifkhlmhmfhfiklgjmloi during development,
- https://wave.webaim.org/ to check web accessibility,
- https://balsamiq.com/ for wireframing.

- Contact page of this project is using backend built wit Node and Express.js,
  SendGrid API is used for sending emails. The server is running on render.com. GitHub repository of the backend is stored <a href="https://github.com/spatulatom/my-porfolio-backend"><strong>right here »</strong></a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- https://alvarotrigo.com/fullPage/ for vertical and horizontal scrolling effect.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

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
