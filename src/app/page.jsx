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
    // const res2 = await axios.get('api/v1/anime/270');
    const res = await axios.get('/api/v1/watch/19');
      console.log("response for watch anime api : ", res.data);
      const streamingData = await axios.get(`/api/v1/gogo/stream/${res.data.gogoSub.episodes[0].id}`);
      const streamingZoro = await axios.get(`api/v1/zoro/stream/${res.data.zoro.episodes[0].episodeId}`, {
        params:{
          // server:"vidstreaming",  //both parameters are optional parameters : vidstreaming is working, streamtape is working as well, other servers cant be guranteed to work
          category: "sub" //default is sub, other options are "dub", "raw"
        }
      });
      console.log("streaming data :: ", streamingData?.data);
      console.log("zoro streaming data:", streamingZoro?.data);

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
