"use client"
import MainCard from '@/Components/mainCard';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';




export default function Top({params}) {

    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    // const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [data, setData] = useState();

    useEffect(() => {
        const fetchData = async (retryCount = 3) => {
          try {
            const response = await axios.get(
              `/api/v1/get-top-anime?filter=${params.category}&page=${page}`
            );
            if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
              setTotalPages(response.data?.totalPages);
              setData(response.data?.data);
              return;
            } else if (retryCount > 0) {
              fetchData(retryCount - 1);
            }
          } catch (error) {
            console.error(`Error fetching ${params.category} data:`, error);
            if (retryCount > 0) {
              fetchData(retryCount - 1);
            }
          }
        };
        fetchData();

        return(()=>{
          setData();
        })
      }, [page, params.category]);


      const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageNumbersToShow = 3;

        // Always show the first page and the last page
        if (totalPages <= maxPageNumbersToShow) {
          for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          // Show the first page
          pageNumbers.push(1);

          // Show ellipsis if the first page is not adjacent to the first of the middle pages
          if (page > 3) {
            pageNumbers.push("...");
          }

          // Show the middle pages
          let startPage = Math.max(page - 1, 2);
          let endPage = Math.min(page + 1, totalPages - 1);

          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }

          // Show ellipsis if the last page is not adjacent to the last of the middle pages
          if (page < totalPages - 2) {
            pageNumbers.push("...");
          }

          // Show the last page
          pageNumbers.push(totalPages);
        }

        return (
          <>
            {pageNumbers.map((pageNumber, index) => (
              typeof pageNumber === "number" ? (
                <Link
                  href = {`/top/${params.category}?page=${pageNumber}`}
                  key={index}
                  className={`px-3 py-1 mx-1 ${page === pageNumber ? 'text-white bg-primary-100 font-bold rounded-full' : 'rounded-full text-gray-400'}`}
                >
                  {pageNumber}
                </Link>
              ) : (
                <span key={index} className="mx-1 text-gray-400">...</span>
              )
            ))}
          </>
        );
      };
      
      return (
        <div className='main pt-16 w-full h-full '>
          <div className='md:mx-4 my-6 py-8 md:px-4 px-2 bg-cbg-200 rounded-md flex flex-col h-full'>
            <h1 className='text-2xl tracking-wide font-bold mb-4 text-primary-400'>{`Top ${params.category === 'bypopularity' ? "popular" : params.category}`}</h1>

            {/* //! create proper skeleton component tomorrow */}
            {/* className='flex h-full w-full' containerClassName='flex flex-1 w-[90vw] h-[30vh]' */}
          {/* <Suspense fallback={<Skeleton className='flex h-full w-full' containerClassName='flex flex-1 w-[90vw] h-[30vh]'/>}>  */}
            <>
            <div className="content w-full h-full grid md:grid-cols-5 gap-4 grid-cols-2 md:gap-6">
              {Array.isArray(data) ? data.map((item, index) => (
                <MainCard key={index} anime={item} />
              ))
            :
            
              [...Array(10)].map((i, idx)=>{
                return (
                  <div key={idx} className='md:mb-4 w-full h-80 md:h-96  rounded-md  flex flex-col  hover:shadow-m overflow-hidden' >
                    <Skeleton  className='flex h-full w-full' containerClassName='my-4 w-full  h-full pb-3 rounded-md  flex flex-1'/>
                  </div>
                )
              })
            
            
            }
            </div>


            <div className="pagination mt-6 text-sm flex justify-center items-center">
            <Link
                href = {`/top/${params.category}?page=${Math.max(1, page-1)}`} 
                className="px-2 py-1 mx-5 text-primary-100 text-xl rounded disabled:text-gray-4000"
              >
                <FaChevronLeft/>
              </Link>
              {renderPageNumbers()}
              <Link
                href = {`/top/${params.category}?page=${Math.min(totalPages, page+1)}`} 
                className="px-2 py-1 mx-5 text-primary-100 text-xl rounded disabled:text-gray-400"
              >
                <FaChevronRight/>
              </Link>
            </div>
            </>
            {/* </Suspense> */}

          </div>
        </div>
      );
}
