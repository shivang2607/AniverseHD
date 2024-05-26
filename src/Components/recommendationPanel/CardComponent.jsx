import React from 'react'
import { FaPlay } from "react-icons/fa6";
import Image from 'next/image';
import { BsDot } from "react-icons/bs";

export default function CardComponent() {
  return (
   <>
    <div className='relative group block max-w-xs mx-auto space-y-2 '>
        <div className="relative w-full h-[168px]">
        <Image 
        src="/download.jpeg" 
        alt="Card Image" 
        layout="fill" 
        objectFit="cover" 
        className="rounded-sm"/>
        </div>
        <div className='absolute left-0 top-[-100%] opacity-0 group-hover:opacity-100 group-hover:top-[-4%] p-4 w-full h-[170px] backdrop-blur-sm transition-all duration-300 scale-100 ease-in-out'>
    
            {/**PLAYBUTTON ****/}
          <div className='but align-middle mx-8 my-11'>
          <FaPlay size={32} style={{color:"#6bb0ab"}}/>
          </div>
          </div>


          <div className='absolute  top-0 left-24 bg-red-500 text-black text-xs font-bold px-1 rounded-sm'>
            18+
          </div>


         {/***BADGES  *********** */}
         <div className='flex space-x-2 my-3'>
          
          <div className='absolute flex top-[135px] left-2 bg-[#18b5aa] text-black text-xs font-bold px-1 rounded-sm'>
            cc
          </div>
          
          </div>
        
         

{/*******DETAILS */}
          <div className='card-content p-1 opacity-80'>
            <h3 className='text-sm font-bold text-zinc-100 font-serif line-clamp-1 truncate'>Oblivion Battery</h3>
            <div className='details flex space-x-2'>
            <p className='font-light text-sm font-sans'>TV </p>
             <div><BsDot /></div>
            <p className='font-light text-sm font-sans'>23 min</p>
            </div>
          </div>
          </div>
        

   </>
  )
}
