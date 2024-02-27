import React, { useState } from 'react'
import styles from "../styles/About.module.css"
import AboutAnimovx from '@/Components/AboutAnimovx'
import OwnerCard from '@/Components/OwnerCard'


const About = () => {
    const [tab,setTab] =useState(1);
    const Abhay={
        name:"Abhay Lodhi",
        img:"/abhayProfile.jpg",
        linkedin:"https://www.linkedin.com/in/abhay-lodhi-065923222/",
        resume:"https://drive.google.com/u/0/uc?id=1PQAjXDzF0upHesxdFDVYsa5Uo1DVUyK5&export=download",
        github:"https://github.com/abhay-lodhi",
        leetcode:"https://leetcode.com/abhaylodhiab11/",
        bio:"Abhay Lodhi is an entry-level software engineer with expertise in web and mobile app development. A passionate competitive programmer and adept problem solver, he thrives on creating innovative solutions for real-world challenges.  Abhay played a pivotal role in developing the backend and also made significant contributions to the frontend of Animovix.",
        worked:[
        ]
    }
    const Shivang={
      name:"Shivang Khandelwal",
      img:"/ShivangProfile.jpg",
      linkedin:"https://www.linkedin.com/in/shivang-khandelwal-0a58951bb",
      resume:"https://drive.google.com/u/0/uc?id=1t6lYTITpQOTPY9ptFDdiEANU0E2yZSof&export=download",
      github:"https://github.com/shivang2607",
      leetcode:"https://leetcode.com/abhaylodhiab11/",
      bio:"Shivang Khandelwal is an entry-level software developer with expertise in web development and Machine Learning . The idea of this Project belongs to him, shivang developed the Recommendation Engine and played vital role in frontend as well,  initially which was meant to be just recommendation system for anime and movies has now become a whole platform for Anime Lovers as himself.",
      worked:[
      ]
  }
  return (
    <div className={styles.main} >  
      <div className={styles.container}>
      <div className={styles.banner}>
       About US
      </div>
      <div className={styles.list}>
      <ul >
        <li onClick={()=>setTab(1)} className={tab==1?styles.activeTab:""}>About Animovix</li>
        {/* <li onClick={()=>setTab(2)} className={tab==2?styles.activeTab:""}>How to Use</li> */}
        <li onClick={()=>setTab(2)} className={tab==2?styles.activeTab:""}>Meet the Developers</li>
    </ul>
    </div>
    <div className={styles.content}>
    {tab==1?
    <AboutAnimovx/>
    :
  
    <div className={styles.cards}>
      <div className={styles.OwnerCard}>
     <OwnerCard  owner={Shivang}/>
     </div>
     <div className={styles.OwnerCard}>
     <OwnerCard  owner={Abhay}/>
     </div>
        </div>
    }
    </div>
    </div>
    </div>
   
  )
}

export default About;

export async function getStaticProps() {

  
  return {
    props: {  
    },
  }
}
