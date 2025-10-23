import React, { useState } from 'react'
import toast from 'react-hot-toast';
import ReportBug from '../firebase/Feedback_and_Reports/reportBug';
import useUserStore from '@/ZustandStores/userStore';
import { Constant_Var_success } from '@/utils/constants';

export default function Bug() {
    const [bugContent, setBugContent] = useState("");
    const {isUserLoggedIn} = useUserStore();

    const handleSubmit = async () => {
        if(bugContent.trim() == ''){
             toast.error("Please type some content.");
             return;
        }
        if(!isUserLoggedIn){
            toast.error("Please Login to Submit report :)");
            return;
        }
        // console.log(bugContent);
        toast.promise(
           new Promise(async (resolve, reject) => {
                const resp = await ReportBug({ Message: bugContent });
              
                    if (resp.status === Constant_Var_success) {
                          resolve(); 
                    } else {
                          reject(); 
                    }
              }),
             {
               loading: 'Reporting...',
               success: <b>Bug Reported Successfully!</b>,
               error: <b>Could not report bug.</b>,
             }
           );
       setBugContent("");
    }
  return (
    <>
        <h1 className='font-semibold text-primary-200 tracking-wide text-xl my-3'>
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
    </>
  )
}
