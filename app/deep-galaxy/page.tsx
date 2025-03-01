import Galaxy from './galaxy'

import {delay} from '@/app/lib/utils'
import {Suspense} from 'react'


export default async function Home() {
//   await delay(22000) // 2 second delay

    return (
      <div className="w-full">
         <h1 className="text-2xl font-bold mb-4 p-2 bg-teal-600 text-center">Exploding Galaxy</h1>

      <Suspense fallback={<p className='flex justify-center items-center pt-8'>Galaxy is loading...</p>}>
        <Galaxy/>
      </Suspense>
    </div>
    )
  }