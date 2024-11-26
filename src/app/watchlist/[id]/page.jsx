"use client"
import React from 'react'

export default function page({params}) {
  return (
    <div className='pt-24 text-lg'>
      Watchlist Id is {params?.id}
    </div>
  )
}
