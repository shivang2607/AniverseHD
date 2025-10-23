import AnimeFilterDropdown from '@/components/utils/DropDownFilter';
import useAnimeSearchFilterStore from '@/ZustandStores/animeSearchFiltersStore';
import { Constant_Enum_animeSearchQueryRating } from '@/utils/constants';
import React from 'react'

const RatingFilter = () => {
    const {rating,setRating}=useAnimeSearchFilterStore();

    return (
      <div className="container mx-auto">
        <AnimeFilterDropdown options={Constant_Enum_animeSearchQueryRating}  selected={rating} setSelected={setRating} heading={"Rated"} />
      </div>
    );
}

export default RatingFilter