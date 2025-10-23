import AnimeFilterDropdown from '@/components/utils/DropDownFilter';
import useAnimeSearchFilterStore from '@/ZustandStores/animeSearchFiltersStore';
import { Constant_Enum_animeSearchQueryType } from '@/utils/constants';
import React from 'react'

const TypeFilter = () => {
    const {type,setType}=useAnimeSearchFilterStore();
  return (
    <div className="container mx-auto">
        <AnimeFilterDropdown options={Constant_Enum_animeSearchQueryType}  selected={type} setSelected={setType} heading={"Type"}/>
      </div>
  )
}

export default TypeFilter