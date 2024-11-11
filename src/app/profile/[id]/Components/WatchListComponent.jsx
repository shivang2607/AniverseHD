import GetWatchListDataById from '@/app/firebase/WatchList/WatchListAnimeList/GetWatchListDataById';
import WatchListCard from '@/components/watchListCard';
import { Constant_Var_success } from '@/utils/constants';
import React, { useEffect, useState } from 'react'

const WatchListComponent = ({selectedWatchList}) => {
    const [list,setList]=useState();

    useEffect(()=>{
        async function loadUserData() {
           const resp= await GetWatchListDataById({watchListId:selectedWatchList.id,getAll:true});
           if(resp.status===Constant_Var_success){
            setList(resp.response);
            console.log(resp.response,"hello");
           }else{
            console.error(resp.response)
           }
          }
      
          loadUserData();
    },[]);
    
  return (
    <div>
      <div className='mx-20 grid md:grid-cols-6 grid-cols-2 gap-4'>
        {list && list.map((ele,ind)=>(
          <WatchListCard anime={ele} key={ind}/>
        ))}
      </div>
    </div>
  )
}

export default WatchListComponent