'use client'
import { useState } from 'react';
import Link from 'next/link';
import { HiMenu, HiX } from 'react-icons/hi';
import SearchComponent from './recommendationPanel/SearchComponent';
import { FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className=" bg-opacity-50 backdrop-blur-sm bg-black border-b-[1px] border-b-primary-500 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex w-full items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold ">AniverseHD</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className=" hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/catalog" className=" hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Catalog
                </Link>
                <Link href="/recommendations" className=" hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Recommendations
                </Link>
                
              </div>
            </div>

           


          </div>
          <div className="flex items-center flex-row-reverse md:flex-row gap-8">
          <div className="ml-auto flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className=" hover:text-white inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
              >
                {isOpen ? (
                  <HiX className="h-6 w-6" />
                ) : (
                  <HiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
            <div className="searchpanel flex gap-2 items-center">
          <div className={`w-80 transition-all duration-200 transform ${searchOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible'} md:block hidden`}>
                 <SearchComponent/> 
                </div>
                <button onClick={()=>setSearchOpen(!searchOpen)}>
                <FaSearch className={`${searchOpen?"text-sky-500":"text-[whitesmoke]"} md:block hidden`} size={20}/>
                </button>
                </div>
            <button className=" bg-primary-200 w-1/2  md:block hidden text-gray-800 font-semibold hover:bg-primary-100 px-6 py-2 rounded-3xl text-sm ">Login</button>
           
          </div>
          
        </div>
        
      </div>




      {/* //? MOBILE VIEW IS FROM BELOW */}
      <div className={`${isOpen ? 'flex' : 'hidden'} md:hidden w-full`}>
        <div className="px-2 pt-2 pb-3 space-y-1 w-full  sm:px-1">
          <Link href="/" className=" hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Home
          </Link>
          <Link href="/catalog" className=" hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Catalog
          </Link>
          <Link href="/recommendations" className=" hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Recommendations
          </Link>
          <div className="relative w-[80%] m-2">
           <SearchComponent/>
          </div>
          <button className="md:w-full block bg-primary-200 !my-3  mx-2 rounded-lg text-gray-800 w-1/6 justify-center hover:bg-primary-100 px-3 py-2  text-sm font-medium">Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
