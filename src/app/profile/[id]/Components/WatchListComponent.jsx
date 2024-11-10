import GetWatchListById from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListById'
import WatchListCard from '@/components/watchListCard';
import { Constant_Var_success } from '@/utils/constants';
import React, { useEffect, useState } from 'react'

const WatchListComponent = ({selectedWatchList}) => {
    const [list,setList]=useState();

    useEffect(()=>{
        async function loadUserData() {
           const resp= await GetWatchListById({watchListId:selectedWatchList.id,offset:0,pageSize:5});
           if(resp.status===Constant_Var_success){
            setList(resp.response);
            console.log(resp.response,"hello");
           }
          }
      
          loadUserData();
    },[])
  return (
    <div>
      <div className='mx-8 grid md:grid-cols-6 grid-cols-2 gap-4'>
        {list && list.map((ele,ind)=>(
          <WatchListCard anime={ele} key={ind}/>
        ))}
      </div>
    </div>
  )
}

export default WatchListComponent