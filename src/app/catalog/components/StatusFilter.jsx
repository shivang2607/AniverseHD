import AnimeFilterDropdown from '@/components/utils/DropDownFilter';
import useAnimeSearchFilterStore from '@/ZustandStores/animeSearchFiltersStore';
import { Constant_Enum_animeSearchQueryStatus } from '@/utils/constants';
import React from 'react'

const StatusFilter = () => {
    const {status,setStatus}=useAnimeSearchFilterStore();
  return (
    <div className="container mx-auto">
        <AnimeFilterDropdown options={Constant_Enum_animeSearchQueryStatus}  selected={status} setSelected={setStatus} heading={"Status"}/>
      </div>
  )
}

export default StatusFilter