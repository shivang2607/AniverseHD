'use client'
import React, { useState } from 'react'
import ReportBug from '../firebase/ReportBug/reportBug';
import { Constant_Var_success } from '@/utils/constants';
import toast, { Toaster } from 'react-hot-toast';

export default function Page() {
    const [bugContent, setBugContent] = useState("");

    const handleSubmit = async () => {
        if(bugContent.trim() == ''){
             toast.error("Please type some content.");
             return;
        }
        // console.log(bugContent);
        toast.promise(
            ReportBug({ Message: bugContent }),
             {
               loading: 'Reporting...',
               success: <b>Bug Reported Successfully!</b>,
               error: <b>Could not report bug.</b>,
             }
           );
       
    }

    return (
        <div className='pt-16 min-h-screen w-full px-4 items-center  text-sm flex flex-col gap-4'>
            <h1 className='font-semibold text-primary-200 tracking-wide text-xl my-6'>
                Report Bug/ Issue you faced
            </h1>
            <textarea placeholder='Please write your issue here...'
                className='rounded-md  p-2 md:w-2/3 w-full mx-4 flex bg-cbg-300 outline-none'
                cols={10} rows={14}
                value={bugContent}
                onChange={e => setBugContent(e.target.value)} />

            <button className='rounded-md px-2 py-1 my-5 bg-primary-100 mx-auto'
                onClick={() => handleSubmit()}>
                Submit
            </button>
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
