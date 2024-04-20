"use client"
import axios from 'axios'
import React, { useEffect } from 'react'


export default function page() {

  useEffect(()=>{
    async function f(){
      const res = await axios.post('/api/v1/recommend', {

        //! One must be passed from either "positive" or "description" in the body payload.
          "positive":[20, 19],
          "description":"Action Anime with Ninjas and Samurai and Katana sword fights!!",
          
        })
    
    
    console.log(res.data)
  }
    f()
  }, [])

  return (
    <div>page</div>
  )
}
