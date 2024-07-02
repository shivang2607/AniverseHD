import React from 'react'

export default function Synopsis({description, background, theme}) {
  return (
    <div className='w-full flex flex-col mx-16'>
        <h1 className='text-2xl font-semibold tracking-wide my-4 mb-8'>Description</h1>
        <div className='text-gray-300 text-sm leading-relaxed text-pretty text-justify'>
        {description ? description?.split('\n')?.map((line, index) => (
            <p key={index}>
                {line} <br/>
            </p>
    )): "NA"}
        </div>
        {background && <div className="background">
            <h2 className='text-xl font-semibold tracking-wide mt-8 my-4'>Background</h2>
            <div className='text-gray-300 text-sm leading-relaxed text-pretty text-justify'>
            {background?.split('\n')?.map((line, index) => (
                <p key={index}>
                    {line} <br/>
                </p>
        ))}
        </div>
        </div>}

        {(theme?.openings?.length > 0 || theme?.openings?.length > 0 ) && <div className="theme-songs flex flex-col my-4">
        <h2 className='text-xl font-semibold tracking-wide mt-8 '>Theme Songs</h2>
            <div className="content flex gap-12 max-h-60 scrollbar-track-transparent overflow-y-scroll scrollbar-thin">
                <div className="opening flex flex-col">
                    <h3 className='text-lg font-semibold text-primary-500 tracking-wide  my-2'>Opening</h3>
                    {
                        theme?.openings?.map(song=>{
                            return ( 
                                <div key={song} className='text-sm my-1 text-gray-400'>{song}</div>
                            )
                        })
                    }
                </div>

                <div className="ending flex flex-col">
                    <h3 className='text-lg font-semibold tracking-wide text-primary-500 my-2'>Ending</h3>
                    {
                        theme?.endings?.map(song=>{
                            return ( 
                                <div key={song} className='text-sm text-gray-400 my-1'>{song}</div>
                            )
                        })
                    }
                </div>

            </div>
        </div>}
    </div>
  )
}
