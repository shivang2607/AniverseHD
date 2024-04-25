"use client"
import axios from 'axios'
import React, { useEffect } from 'react'


export default function page() {
 
  useEffect(()=>{
    async function f(){
      // const res = await axios.post('/api/v1/recommend', {

      //   //! One must be passed from either "positive" or "description" in the body payload.
      //     "positive":[20, 19],
      //     "description":"Action Anime with witch craft and supernatural stuff, can be horror as well!!",
          
      //   }) 
      //   console.log(res.data)
    
      // const searchResults = await axios.get('/api/v1/search?q=blea');
      // console.log(searchResults);

      //for getting anime details
      const animeDetails = await axios.get('/api/v1/anime/52588');
      console.log(animeDetails.data); 


      // const searchResults = await axios.get('/api/v1/genereFilter?genres=Action,Hentai&minScore=9');
      // console.log(searchResults);
  }
    f()
  }, [])

  return (
    <div>page</div>
  )
}
