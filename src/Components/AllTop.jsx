import React from 'react'

export default function AllTop() {
  return (
    <div className="my-20 p-4  flex flex-col md:flex gap-4">
        <div className="top-airing flex w-full md:w-1/4 flex-col gap-4">
            <h2 className='text-primary-500 text-lg font-semibold tracking-wide'>Top Airing</h2>
            <div className="flex flex-col gap-2">
                {[...Array(5)].map((i, key)=>{
                    return (
                        <div key={key} className='flex items-center gap-6'>
                            Image aayegi idhar
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  )
}
