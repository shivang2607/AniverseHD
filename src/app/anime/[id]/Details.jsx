import React from 'react'

export default function Details({anime}) {

    const startDate = new Date(anime?.aired?.from).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    
      const endDate = new Date(anime?.aired?.to).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    const details = [
        {
            label: "Type",
            value: anime?.type?.toUpperCase() || "?"
        },
        {
            label: "Episodes",
            value: anime?.episodes || "?"
        },
        {
            label: "Status",
            value: anime?.status || "?"
        },
        {
            label: "Aired",
            value: `${startDate} to ${endDate}`
        },

    ]
  return (
    <div className='flex flex-col border-cbg-300 w-full pr-4 px-1'>
        <h1 className='text-2xl font-semibold tracking-wide my-4'>Details</h1>

        <div className="content flex flex-col gap-2">
        {
            details?.map(det=>{
                return ( 
                <div className="flex gap-3 text-xs w-full">
                <span className='font-semibold  text-primary-500'>{det.label}:</span>
                <span>{det.value}</span>
                </div>
            )
            })
        }
        </div>
           

    </div>
  )
}
