import React, { useState } from 'react'
import SearchComponent from './SearchComponent'
import Link from 'next/link';
import DescriptionBased from './DescriptionBased';
import AnimeBased from './AnimeBased';


export default function RecommendationPanel() {

  const [isDescription, setDescription] = useState(true);
  

  return (
    <div className=' flex-col flex gap-4 my-16'>
      <h1 className="text-primary-500 px-4 font-semibold text-2xl tracking-wide">
        Recommendations Box
      </h1>
      <div className='w-full bg-recommendation-box-banner bg-cover bg-center  bg-no-repeat h-fit'>
      <div className="panel bg-gradient-to-l backdrop-blur-sm   from-black to-transparent shadow-md w-full h-fit pb-12   flex flex-col p-4 px-6 bg-opacity-30 bg-black" >

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
          {isDescription ? <DescriptionBased/>: <AnimeBased/> }
          
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
