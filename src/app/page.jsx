"use client"
import axios from 'axios'
import ResponsiveCarousal from '../components/Carousal'
import React, { useEffect } from 'react'
import TopAiringCarousal from '@/components/TopAiringCarousal'
import RecommendationPanel from '@/components/recommendationPanel/RecommendationPanel'
import AllTop from '@/components/AllTop'


export default function page() {
 
  
  useEffect(()=>{
    
    async function f(){
      
    const res = await axios.get('/api/v1/watch/55701');
      console.log("response for watch anime api : ", res.data);
    }
    f()
  }, [])
  

  return (
    <div>
      <ResponsiveCarousal/>
      <TopAiringCarousal/>
      <RecommendationPanel/>
      <AllTop/>
    </div>
  )
}
