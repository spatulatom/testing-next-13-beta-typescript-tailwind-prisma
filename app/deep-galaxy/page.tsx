// export const dynamic = 'force-static' // This will force the page to be dynamic and not cached

import {delay} from '@/app/lib/utils'
import {Suspense} from 'react'
import Ssr from './testing-ssr'


export default async function Home() {
//   await delay(22000) // 2 second delay

    return (
      <div className="w-full">
         <h1 className="text-2xl font-bold mb-4 p-2 bg-teal-600 text-center">Exploding Galaxy</h1>

      <Suspense fallback={<p className='flex justify-center items-center pt-8'>Galaxy is loading...</p>}>
        <Ssr/>
      </Suspense>
    </div>
    )
  }