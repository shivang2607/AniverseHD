import React, { useState } from 'react'
import ReactStars from "react-rating-stars-component";
import FeedBack from '../firebase/Feedback_and_Reports/Feedback';
import useUserStore from '@/components/ZustandStores/userStore';
import toast from 'react-hot-toast';

export default function Feedback() {

    const [rating, setRating] = useState();
    const [feedbackContent, setFeedbackContent] = useState("");
    const {isUserLoggedIn} = useUserStore();

    const ratingChanged = (newRating) => {
        setRating(newRating);
    }

    const handleSubmit = () => {
        if(!isUserLoggedIn){
            toast.error("Please Login to Submit Feedback :)");
            return;
        }

        toast.promise(
            FeedBack({ Message: feedbackContent.trim(), Stars: rating }),
             {
               loading: 'Submitting...',
               success: <b>Feedback Submitted Successfully!</b>,
               error: <b>Could not Submit Feedback.</b>,
             }
           );
       setFeedbackContent("");
    
    }

  return (
    <>
        <h1 className='font-semibold text-primary-200 tracking-wide text-xl my-3'>
                Rate us and give your valuable feedback 🧡
            </h1>
            <div className='stars my-2'>
            <ReactStars
                count={5}
                onChange={ratingChanged}
                isHalf = {true}
                size={30}
                className="text-primary-100 my-4"
            />
            </div>
            <textarea placeholder='Write your feedback here (optional)'
                className='rounded-md  p-2 md:w-2/3 w-full mx-4 flex bg-cbg-300 outline-none'
                cols={10} rows={14}
                value={feedbackContent}
                onChange={e => setFeedbackContent(e.target.value)} 
                />

            <button className='rounded-md px-2 py-1 my-5 bg-primary-100 mx-auto'
                onClick={() => handleSubmit()}
                >
                Submit
            </button>
    </>
  )
}
