// export const dynamicParams = true
import HalftoneWaves from './halftone-waves'

import {delay} from '@/app/lib/utils'
import {Suspense} from 'react'


export default async function Home() {
  await delay(2000) // 2 second delay

    return (
      <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 p-2 bg-teal-600 text-center">Hipnotizing Waves -this is server component atrificialy delayed by 3s, waves below are its child client component</h1>
      <Suspense fallback={<p className='flex justify-center items-center pt-8'>Hipnotising Waves are loading...HW is client component artificially dealyed, what we see is fallback message on Suspense</p>}>
        <HalftoneWaves />
      </Suspense>
    </div>
    )
  }