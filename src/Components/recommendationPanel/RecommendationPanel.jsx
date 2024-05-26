import React, { useState } from 'react'
import SearchComponent from './SearchComponent'
import { GrPowerReset } from "react-icons/gr";
import { RxReset } from "react-icons/rx"
import { GiStarSwirl } from "react-icons/gi";
import Link from 'next/link';
import SharinganLoader from '../sharinganLoader';



export default function RecommendationPanel() {

  const [isDescription, setDescription] = useState(true);

  return (
    <div className=' flex-col flex gap-4 my-16'>
      <h1 className="text-primary-500 px-4 font-semibold text-2xl tracking-wide">
        Recommendations Box
      </h1>
      <div className='w-full bg-recommendation-box-banner bg-cover bg-center  bg-no-repeat h-fit'>
      <div className="panel bg-gradient-to-l backdrop-blur-sm   from-black to-transparent shadow-md w-full h-[80vh]   flex flex-col p-4 px-6 bg-opacity-30 bg-black" >

        <div className="toggle flex w-[30%] mx-auto overflow-hidden  rounded-lg">
          <button className={`w-1/2 items-center flex justify-center text-white  p-2 ${isDescription?"bg-primary-100":"bg-cbg-100"} `} onClick={()=>setDescription(true)}>
            Description based
            </button>

            <button className={`w-1/2 items-center flex justify-center text-white p-2 ${!isDescription?"bg-primary-100":"bg-cbg-100 "}`} onClick={()=>setDescription(false)}>
            Anime based
            </button>
        </div>

        <div className="main flex justify-between w-full h-full mt-8">
      
        <div className="description-results-block w-[65%] ">

          <div className="description-block flex flex-col gap-4 px-16">
            <textarea  placeholder='Enter Description, eg: Anime with demons and monster and swords fights in it and suspense thriller action packed.' class=" block w-full p-2  outline-none rounded-md shadow-sm scrollbar-thin bg-cbg-200"></textarea>

            <div className="button-sets flex justify-end gap-2">
              <button className='rounded-md font-semibold  text-primary-300 hover:text-primary-400  p-1 px-2 flex items-center gap-1'> <RxReset size={18}/> Reset</button>
              <button className='rounded-md hover:bg-primary-300 bg-primary-200 text-cbg-100 font-semibold p-1 px-3 flex items-center gap-1'> <GiStarSwirl  size={18}/> Recommend</button>
            </div>
            
            <div className="loading items-center gap-3 flex flex-col">
            <div className=" w-36 h-36 mx-auto mt-8 flex ">
              <SharinganLoader/>
            </div>
            <h3 className='text-xl text-red-500 backdrop-brightness-0 p-1 font-semibold'>Please wait...This may take a while</h3>
            </div>
            


          </div>
        </div>

        <div className="info flex text-sm w-[35%] italic text-gray-300 tracking-wider">
        <p>
                Welcome to our  <b>Recommendation Panel!</b> 🌟 Ever wished for an anime
                that matches your exact taste? Well, now you can! Just type in a
                description or select an anime, hit the <b>Recommend</b> button,
                and voilà—our magic algorithm will find you anime with the most
                similar vibes and storylines.
                <br /> <br />
                But wait, there's more! For even more awesome features and
                filters, be sure to visit our full  <Link href="/recommendations" className='text-fuchsia-400'> Recommendation Page </Link>. It's a
                treasure trove for anime lovers like you. 🎉
                <br /> <br />
                <b className='underline'>Pro Tip:</b> While our system is pretty smart, typing gibberish
                might lead to some... interesting anime picks. So keep it real
                for the best results!
                <br /> <br />
                Ready to discover your next favorite anime? Dive in and start
                exploring! 🚀
              </p>
        </div>

        </div>

      </div>
      </div>
    </div>
  )
}
