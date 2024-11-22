"use client";
import axios from "axios";
import ResponsiveCarousal from "../components/Carousal";
import React, { useEffect } from "react";
import TopAiringCarousal from "@/Components/TopAiringCarousal";
import RecommendationPanel from "@/Components/recommendationPanel/RecommendationPanel";
import AllTop from "@/Components/AllTop";
import RecentWatching from "@/Components/RecentWatching";


export default function Page() {

  useEffect(() => {
    async function f() {
      
    }
    // f()
  }, []);

  return (
    <div>
      <ResponsiveCarousal />
      <TopAiringCarousal />
      <RecommendationPanel />
      <AllTop />
      <RecentWatching/>
    </div>
  );
}
