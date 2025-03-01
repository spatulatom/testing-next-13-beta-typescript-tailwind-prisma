import Galaxy from './galaxy'

import {delay} from '@/app/lib/utils'
import {Suspense} from 'react'


export default async function Home() {
//   await delay(22000) // 2 second delay

    return (
      <div className="w-full">

      <Suspense fallback={<p className='flex justify-center items-center pt-8'>This is Suspense fallback. Galaxy is loading...</p>}>
        <Galaxy/>
      </Suspense>
    </div>
    )
  }