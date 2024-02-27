import React from 'react'
import axios from "axios";

const Series = () => {
  return (
    <div>Series</div>
  )
}

export default Series;

export async function getStaticProps() {

  axios.get('https://animovixrecommendations.onrender.com/')
  
  return {
    props: {  
    },
    revalidate: 1000,
  }
}