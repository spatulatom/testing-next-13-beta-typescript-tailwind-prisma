// export const dynamicParams = true
import HalftoneWaves from './halftone-waves'
import {delay} from '@/app/lib/utils'
import {Suspense} from 'react'



export default async function Home() {
  await delay(3000) // 2 second delay

    return (
      <div className="w-full">
      <h1 className="text-2xl font-bold mb-4 p-2 bg-teal-600 text-center">Hipnotizing Waves</h1>
      <Suspense fallback={<p className='flex justify-center items-center pt-8'>Hipnotising Waves are almost here, do not turn off you PC...</p>}>
        <HalftoneWaves />
      </Suspense>
    </div>
    )
  }