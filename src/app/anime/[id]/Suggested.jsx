import MainCard from '@/components/mainCard';
import useAnimeStore from '@/components/utils/animeStore';
import React, { useState } from 'react'
import { useEffect } from 'react'

export default function Suggested({id}) {

    const {getRecommendationsById} = useAnimeStore()
    const [suggestions, setSuggestions] = useState();

    useEffect(()=>{
        (async ()=>{
            const data = await getRecommendationsById(id);
            // console.log("suggestions",data);
            setSuggestions(data);
        })();
    }, []);
  return (
    <div className='flex flex-col md:px-8 px-4 gap-4 my-16'>
        <h1 className='text-primary-400 font-semibold tracking-wide text-2xl'>You may also like</h1>
        <div className='grid md:grid-cols-5 grid-cols-2 gap-4'>
        {suggestions?.map(anime=>{
            return (
                <MainCard anime={({...(anime.payload), mal_id: anime.id})} key={anime.id}/>
            )
        })}
        </div>

    </div>
  )
}
