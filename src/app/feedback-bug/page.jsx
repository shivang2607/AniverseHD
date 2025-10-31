'use client'
import React, { useState } from 'react'
// import { Constant_Var_success } from '@/utils/constants';
import  { Toaster } from 'react-hot-toast';
import Bug from './Bug';
import Feedback from './Feedback';

export default function Page() {
    const [selectedTab, setSelectedTab] =  useState("feedback");


    return (
        <div className='pt-16 min-h-screen w-full px-4 items-center  text-sm flex flex-col gap-4'>
            <div className="tabs flex bg-cbg-300 font-semibold mt-8 rounded-md justify-center items-center overflow-hidden">
                <button className={`feedback px-2 py-1 ${selectedTab === "feedback" ? "bg-primary-200 ":""}`} onClick={()=>setSelectedTab("feedback")}>Feedback</button>
                <button className={`report-bug px-2 py-1 ${selectedTab === "bug" ? "bg-primary-200 ":""}`} onClick={()=>setSelectedTab("bug")}>Report Bug</button>
            </div>

            {selectedTab === "feedback" ? <Feedback/> :
            <Bug/>
            }

            <Toaster
                toastOptions={{
                    style: {
                        borderRadius: "10px",
                        background: "#b6d7d4",
                        border: "1px solid ",
                        color: "#041C32",
                    },
                }}
            />
        </div>
    )
}
