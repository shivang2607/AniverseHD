"use client"
import axios from 'axios'
import ResponsiveCarousal from '../components/Carousal'
import React, { useEffect } from 'react'
import TopAiringCarousal from '@/components/TopAiringCarousal'


export default function page() {
 
  
  useEffect(()=>{
    
    async function f(){
      
      // const res = await axios.post('/api/v1/recommend', {

      //   //! One must be passed from either "positive" or "description" in the body payload.
      //     "positive":[20, 19],
      //     "description":"Action Anime with witch craft and supernatural stuff, can be horror as well!!",
          
      //   }) 
      //   console.log(res.data)
    
       
      // const animeDetails = await axios.get('/api/v1/anime/1');
      // console.log(animeDetails.data); 


      // get top anime 
      // const topAnime = await axios.get('/api/v1/get-top-anime');
      // console.log(topAnime);
  
  }
    f()
  }, [])
  

  return (
    <div>
      <ResponsiveCarousal/>
      <TopAiringCarousal/>
    </div>
  )
}
