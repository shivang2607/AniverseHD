import Link from 'next/link';
import React from 'react'

export default function Relations({relations}) {
  return (
    <div className='w-full flex flex-col gap-4 px-8 my-8'>
        <h1 className='text-primary-400 font-semibold text-xl tracking-wide'>Relations</h1>

        <div className="relations grid grid-cols-5 gap-4 w-full">
            {relations?.map(rel=>{
                const {relation, entry} = rel;
                
                return (
                    entry?.map(ent=>{
                        return (
                            <Link 
                                href={`/anime/${ent?.mal_id}`} 
                                key={ent?.mal_id} 
                                className='relative overflow-hidden items-center justify-center flex w-full h-full font-semibold rounded-xl hover:scale-105 duration-300 px-3 py-4 text-lg text-gray-300 bg-black/30 hover:bg-black/50'
                                >
                                <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold tracking-wide text-primary-600 backdrop-blur-lg bg-black/10 opacity-0 hover:opacity-100 duration-300 ease-in-out">
                                    {relation}
                                </div>
                                <div>{ent?.name}</div>
                                </Link>

                        )
                    })
                )
            })
        }
        </div>
    </div>
  )
}
