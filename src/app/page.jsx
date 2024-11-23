"use client";
import axios from "axios";
import ResponsiveCarousal from "../components/Carousal";
import React, { useEffect } from "react";
import TopAiringCarousal from "@/components/TopAiringCarousal";
import RecommendationPanel from "@/components/recommendationPanel/RecommendationPanel";
import AllTop from "@/components/AllTop";
import RecentWatching from "@/components/RecentWatching";


export default function Page() {

  useEffect(() => {
    async function f() {
      
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
    </div>
  );
}
