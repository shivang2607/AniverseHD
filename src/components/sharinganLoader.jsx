import Image from 'next/image'
import React from 'react'

export default function SharinganLoader() {
  return (
    <div className='relative overflow-hidden rounded-full h-full w-full object-cover object-center'>
        <Image src="/sharingan loader.gif" unoptimized alt='Loading...' fill className=''/>
    </div>
  )
}
