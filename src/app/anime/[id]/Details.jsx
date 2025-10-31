import React from 'react'

export default function Details({anime}) {



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
            label: "Duration",
            value: anime?.duration || anime?.episode_duration || "?"
        },
        {
            label: "Score",
            value: anime?.score || "?"
        },
        {
            label: "Rating",
            value: anime?.rating || "?"
        },
        {
            label: "Status",
            value: anime?.status || "?"
        },
        {
            label: "Season",
            value: anime?.season || "?"
        },
        {
            label: "Aired",
            value: anime?.aired?.string || "?"
        },
        {
            label: "Rank",
            value: anime?.rank || "?"
        },
        {
            label: "Popularity",
            value: anime?.popularity || "?"
        },
        {
            label: "Genres",
            value: anime?.genres?.join(", ") || "?"
        },
        {
            label: "Themes",
            value: anime?.themes?.join(", ") || "?"
        },
        {
            label: "Demographics",
            value: anime?.demographics?.join(", ") || "?"
        },
        {
            label: "Favorites",
            value: anime?.favorites || "?"
        },
        {
            label: "Members",
            value: anime?.members || "?"
        },
        {
            label: "Source",
            value: anime?.source || "?"
        },
        {
            label: "Studios",
            value: anime?.studios?.map(studio=>studio.name).join(", ") || "?"
        },
        {
            label: "Licensors",
            value: anime?.licensors?.map(p=>p.name).join(", ") || "?"
        },
        // {
        //     label: "Producers",
        //     value: anime?.producers.map(p=>p.name).join(", ")
        // },
    ]
  return (
    <div className='flex flex-col  rounded shadow-sky-500 my-2 md:w-1/5 w-full pr-4 px-2' 
    // style={{ boxShadow: '4px 0 10px -2px #0ea5e9' }}
    >
        <h1 className='text-2xl font-semibold tracking-wide my-2 mb-8'>Details</h1>

        <div className="content md:flex md:flex-col grid grid-cols-2  md:gap-3 gap-4">
        {
            details?.map(det=>{
                return ( 
                <div key={det.label} className="inline-flex gap-1 md:gap-3 md:text-xs text-sm w-full items-start">
                    <span className='font-semibold text-primary-500 flex-none'>{det.label}:</span>
                    <span className='text-gray-300'>{det.value}</span>
                </div>
                
            )
            })
        }
        </div>
           

    </div>
  )
}
