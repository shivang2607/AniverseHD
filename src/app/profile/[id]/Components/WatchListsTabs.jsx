import { Constant_Var_starterWatchLists_recent } from '@/utils/constants';
import React from 'react'

const WatchListsTabs = ({WatchLists}) => {
    
  return (
    <div className='flex flex-row'>
        {WatchLists.map((ele, ind) => {
        return (
          !(
            ele.watchListName === Constant_Var_starterWatchLists_recent &&
            ele.isSpecialStarter
          ) && <div key={ind} className="mx-5">{ele.watchListName}</div>
        );
      })}
      </div>
  )
}

export default WatchListsTabs