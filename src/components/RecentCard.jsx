import RemoveAnimeFromWatchList from '@/app/firebase/WatchList/UpdateWatchLists/RemoveAnimeFromWatchList'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { FaPlay } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { MdMovie } from 'react-icons/md'
import useUserStore from '@/ZustandStores/userStore'
import { Constant_Var_success } from '@/utils/constants'

export default function RecentCard({anime, grid=false}) {

    const {RecentWatchListId, loadLoggedInUserRecentWatchList, loadLoggedInUserWatchLists} = useUserStore();

    

    const handleOnRemove = async(e)=>{
        e.preventDefault();
        e.stopPropagation();
        const result = await RemoveAnimeFromWatchList({
            watchListId: RecentWatchListId,
            animeId: anime?.animeId,
          });
        loadLoggedInUserRecentWatchList();
        loadLoggedInUserWatchLists();
        
        if (result.status !== Constant_Var_success){
            toast.error("Can't Remove Anime from Recent Watch list")
        }
    }


    const formatTime = (seconds) => {
        // Calculate hours, minutes, and seconds
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.round(seconds % 60);
      
        // Format hours, minutes, and seconds to be 2 digits
        const formattedHours = hours > 0 ? `${hours}:` : ''; // Show hours if greater than 0
        const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const formattedSeconds = secs < 10 ? `0${secs}` : `${secs}`;
      
        return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
      };

  return (
    <div className={`image-container  my-1 ${grid ? "w-full  h-96" : "md:w-1/6 w-[35%] h-80"} flex-shrink-0 md:h-fit  pb-1 rounded-md  flex flex-col  hover:shadow-m overflow-hidden`}>
      <Link
        href={`${anime?.url}&t=${anime?.episodeTimestamp}`}
        className=" flex relative flex-col gap-2 h-72  rounded-md overflow-hidden duration-300 transition-all w-full   "
      >
        <div className="image relative rounded-md overflow-hidden  h-full w-full ">
          <Image
            fill
            src={
              anime?.main_picture ||
              anime?.animePhoto?.webp?.large_image_url ||
              anime?.animePhoto?.jpg?.large_image_url
            }
            alt={anime?.animeName || "Anime title"}
            className="object-cover "
          />
        </div>
        <div className="z-10 bg-non hover:backdrop-brightness-75 rounded-md overflow-hidden hover:backdrop-blur-sm  o0 bg-gradient-radial from-transparent to-black via-transparent transition-all duration-200 ease-in-out  absolute h-full w-full">
          <div className="content flex flex-col  w-full h-full z-10">
            <div className="flex">
             
              <div className="flex  m-2 bg-red-500 px-1 rounded-sm items-center text-sm">
                {anime?.animeAgeRating?.split(" ")[0].toUpperCase() || "NA"}
              </div>

              <button className='z-20 absolute m-1 right-0 rounded-full border-[1px] border-cbg-100  bg-primary-500 p-1' onClick={handleOnRemove}><IoMdClose className='text-cbg-100'/></button>
            </div>
            <div className="absolute  play hover:opacity-100 opacity-0 flex h-full w-full items-center justify-center ">
              <FaPlay size={50} className="text-primary-400 opacity-85" />
            </div>
            <div className="flex mt-auto m-2 gap-1 text-xs">
              <div className="score bg-sky-700 text-gray-200 font-semibold px-1   rounded-sm">
              { typeof anime?.animeScore === "number" ? anime.animeScore.toFixed(2) :( anime?.animeScore || "NA")}
              </div>
              <div className="bg-primary-300 text-cbg-100 font-semibold px-1  rounded-sm">
                {anime?.animeStartYear || "NA"}
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="metacontent flex flex-col gap- p-2">
        

        <div className='progress flex flex-col gap-2 w-full my-4'>
            <div className="timeWatched flex ml-auto font-semibold text-xs">
                <div className='text-primary-100'>{formatTime(anime?.episodeTimestamp)}</div> &nbsp;
                {anime?.duration && `/ ${formatTime(anime?.duration)}`}
            </div>
        <div className=" w-full h-1 rounded-full bg-cbg-300">
            <div className="h-full bg-primary-100" style={{width: `${(100 * anime?.episodeTimestamp/anime?.duration) || 1}%`}}></div>
        </div>
        </div>



        <Link
          href={`/anime/${anime?.animeId}`}
          className="title text-lg tracking-wide font-semibold line-clamp-1 text-gray-200"
        >
          {anime?.animeName || "NA"}
        </Link>
        <div className="details flex text-sm  items-center w-full gap-2 text-gray-400">
          <p className="  flex gap-1 items-center">
            <MdMovie className="" />
            {anime?.animeType?.toUpperCase() || "NA"}
          </p>
          {/* <div className="gap-1 flex items-center mx-2">
            <div>
              <IoMdTimer className=" font-bold" />
            </div>
            <span className=" text-sm text-nowrap">
              {anime?.duration || anime?.episode_duration?.split(" ")[2]}
            </span>
          </div> */}
        </div>
      </div>
      <Toaster
                toastOptions={{
                  style: {
                    borderRadius: "10px",
                    background: "#b6d7d4",
                    border: "1px solid ",
                    color: "#041C32",
              
                  },
                }}
              />
    </div>
  )
}
