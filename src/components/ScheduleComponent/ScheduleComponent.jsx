import axios from 'axios';
import React from 'react'
import { useState, useEffect } from 'react'
import ScheduleCard from './ScheduleCard';
import { uniqueId } from 'lodash';
import { getWithExpiry, setWithExpiry } from '../utils/storage';

export default function ScheduleComponent() {

    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [selectedDay, setSelectedDay] = useState();
    const [scheduledData, setScheduledData] = useState();
    const todayIndex = new Date().getDay();


    useEffect(() => {
        
        setSelectedDay(daysOfWeek[todayIndex]);
      }, []);

      
      useEffect(() => {
          if (selectedDay) {
              const currentWeek = getCurrentWeekNumber();
              const cachedData = getWithExpiry(`scheduledData-${currentWeek}-${selectedDay}`);
              
              if (cachedData) {
                  // If data exists in localStorage, use it
                  setScheduledData(JSON.parse(cachedData));
                 
                 
                } else {
                    // Otherwise, make the API request
                    (async () => {
                        const apiUrl = "https://api.jikan.moe/v4/";
                        try {
                            const res = await axios.get(`${apiUrl}schedules?filter=${selectedDay.toLowerCase()}&sfw=true`);
                            setScheduledData(res.data);
                            
                            // Cache the data in localStorage
                            setWithExpiry(`scheduledData-${currentWeek}-${selectedDay}`, JSON.stringify(res.data), 1000 * 60 * 60 * 24 * 2); //cache for 2 days
                          
                        } catch (error) {
                            console.error("Error fetching data:", error);
                        }
                    })();
                }
            }
            
            return () => {
            };
        }, [selectedDay]);
        
        // Function to get the current week number
       const getCurrentWeekNumber = () => {
         const date = new Date();
         const startDate = new Date(date.getFullYear(), 0, 1);
         const diff = date - startDate;
         const oneWeek = 1000 * 60 * 60 * 24 * 7;
         return Math.ceil(diff / oneWeek);
       };

       



  return (
    <div className=" flex-col flex gap-4 p-4 md:mt-16 mt-8 mb-2 ">
      <div className='flex w-full items-center justify-between'>
      <h1 className="text-primary-500 flex font-semibold text-2xl tracking-wide">
        Scheduled Episodes This Week
      </h1> 
      </div>

        <div className="days flex flex-wrap gap-2 items-center my-4">
            {daysOfWeek?.map(day => {
                return (
                    <div key={day} className={`rounded-full p-2 cursor-pointer ${selectedDay===day ? "bg-primary-300" : "bg-gray-200"} text-cbg-100`} onClick={()=>setSelectedDay(day)}>
                        {day} {day===daysOfWeek[todayIndex] && "(Today)"}
                    </div>
                )
            })}
        </div>

        <div className='grid md:grid-cols-7 grid-cols-3 gap-4'>
            {scheduledData?.data?.map(anime => {
                return (
                    <ScheduleCard anime={anime} key={uniqueId(`${anime?.mal_id}`)}/>
                )
            })}
        </div>

    </div>
  )
}
