import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import styles from '@/styles/Feedback.module.css'
import  {useFirebase}  from '@/context/firebaseContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Feedback = () => {
   const [value, setValue] = useState(0);
   const [feed, setFeed] = useState("");
   const [loading, setLoading] = useState(true);
   const {submitFeedback, checkUserCookies} = useFirebase();

   const router = useRouter();

   useEffect(() => {
     if(!checkUserCookies())router.replace("/");
     else setLoading(false);
   
   }, [])
   

    const notify = async()=>{
        if(value===0){
            toast.info("Please give some rating !!",{
                position:"top-center",
                theme:"dark",
                autoClose: 5000,
                hideProgressBar: false,
                progress: undefined,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                limit:2,
                toastId:"info",

            })
            return;
        }
        // const submit = await submitFeedback(5);
        // console.log(submit);
       
        toast.promise(submitFeedback(value, feed.trim()), {
            pending: "Submitting your Feedback !",
            success: "Thank you for submitting your Feedback!!",
            error: "Failed to Submit the feedback, Please try again later !",
            
        },
        {
         position:"top-center",
         theme:"dark",
         autoClose: 5000,
         hideProgressBar: true,
         closeOnClick: true,
         progress:undefined,
         pauseOnHover: false,
         draggable: true,
         limit:2,
         toastId:"submit-feedback"
        }
        )
    }

const handleChange=(e)=>{
    const val = e.target.value;
    if(val.trim().length>400){
        toast.warn("Maximum of 400 characters are allowed !", {
            position:"top-center",
            theme:"light",
            autoClose: 2000,
            limit:1,            
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            progress:undefined,
            draggable: true,
            toastId: 'warn'
        })
        return;
    }
    setFeed(val);
}



  return (
    <>
    {!loading && <div className={styles.main}>
        <div className={styles.container}>
            <p>Please Submit your valuable Reviews and/or give us Feedback...</p>
    
    <div className={styles.rating}>
        {
            [1,2,3,4,5].map(id => {                
                return (<>
                <input value={6-id} name="star-radio" id={`star-${id}`} type="radio" onChange={e=>setValue(e.target.value)}/>
                <label htmlFor={`star-${id}`}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" pathLength="360"></path></svg>
                </label>
                </>
                )
            })
        }

</div>
<div className={styles.feedback}>
<textarea  rows="10" cols="50" value={feed} placeholder='Please Write Your Feedback...' onChange={(e)=>handleChange(e)}/>

</div>
<div className={styles.btn}>
<button onClick={()=>notify()}>Submit Feedback</button>
<ToastContainer
position="top-center"
closeOnClick
rtl={false}
draggable
theme="dark"
/>
<ToastContainer />
</div>
</div>
    </div>}
    </>
  )
}

export default Feedback