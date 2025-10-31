"use client";
import axios from "axios";
import ResponsiveCarousal from "../components/Carousal";
import React, { useEffect } from "react";
import TopAiringCarousal from "@/components/TopAiringCarousal";
import RecommendationPanel from "@/components/recommendationPanel/RecommendationPanel";
import AllTop from "@/components/AllTop";
import RecentWatching from "@/components/RecentWatching";
import jikanjs from "@mateoaranda/jikanjs";
import ScheduleComponent from "@/components/ScheduleComponent/ScheduleComponent";
import { getTorrentData } from "@/app/torrent/utils/torrentsData";


export default function Page() {



  useEffect(() => {
    async function f() {
      
      await getTorrentData("berserk");
      console.log("function executed")
    
      }

    // f()
  }, []);

  return (
    <div>
      <ResponsiveCarousal />
      <RecentWatching/>
      <TopAiringCarousal />
      <RecommendationPanel />
      <AllTop />
      <ScheduleComponent/>
    </div>
  );
}
