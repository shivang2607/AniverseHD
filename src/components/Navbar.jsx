"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import SearchComponent from "./recommendationPanel/SearchComponent";
import { FaSearch } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Image from "next/image";
import DropDownNavbarUserAvatar from "./DropDownNavbarUserAvatar";
import useUserStore from "./ZustandStores/userStore";
import WatchlistBar from "./WatchlistBar";
import useGlobalLoader from "./ZustandStores/useGlobalLoader";
import { Constant_Var_localstorage_version } from "@/utils/constants";

const Navbar = () => {
  const { isUserLoggedIn, login, loadLoggedInUserDataAndWatchLists,RecentWatchListId, loadLoggedInUserRecentWatchList, hideWatchlistBar} = useUserStore();
  const router = useRouter();
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
  // const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  // const [loggedInUserData, setLoggedInUserData] = useState(null);
  const { setLoaderText, setIsLoaderVisible,setImageUrl } = useGlobalLoader();
  const handleSignIn = async () => {
    setIsLoaderVisible(true);
    setImageUrl(" /userProfileImage7.jpg")
    await login((status)=>{
      setLoaderText(status)
    });

    setIsLoaderVisible(false)
    setLoaderText(null)
    setImageUrl(null)
  };



  const handleScroll = () => {
    if (["/recommendations"].some((path) => path === currentPath)) return;
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && !isScrollingUp) {
      // Scrolling down
      setShowNavbar(false);
    } else if (currentScrollY < lastScrollY && isScrollingUp) {
      // Scrolling up
      setShowNavbar(true);
    }

    if (window.scrollY > 1) {
      setIsBackgroundVisible(true);
    } else {
      setIsBackgroundVisible(false);
    }

    setIsScrollingUp(currentScrollY < lastScrollY);
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    router.prefetch("/profile");

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, isScrollingUp]);

  useEffect(() => {
    setShowNavbar(true);
    setIsOpen(false);
  }, [currentPath]);


  useEffect(() => {
    // loadUserData();
    loadLoggedInUserDataAndWatchLists();
  }, []);

 
  useEffect(()=>{
    if(RecentWatchListId)
    loadLoggedInUserRecentWatchList();
  },[RecentWatchListId]);

  useEffect(()=>{
    const localstorage_version= localStorage.getItem("version");
    if(!localstorage_version || localstorage_version !== Constant_Var_localstorage_version){
      localStorage.clear();
      localStorage.setItem("version",Constant_Var_localstorage_version);
      sessionStorage.clear();
    }
  },[]);

  return (
    <>
    <nav
        className={`fixed py-1 border-[1.5px] border-primary-100 w-[97%] self-center items-center md:mx-6 mx-1 block justify-center ${isOpen ? "rounded-xl" : "rounded-full"}   my-2  z-50 transition-transform duration-300 backdrop-blur-sm ${
          showNavbar ? "translate-y-0" : "-translate-y-[120%]"
        } ${isBackgroundVisible ? "bg-cbg-100/70" : "bg-cbg-100/30"}`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 ">
        <div className="flex items-center justify-between h-fit py-1">
          <div className="flex w-full items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="logo relative md:w-48 w-40 h-7 md:h-8">
                  <Image
                    src="/logo-primary.png"
                    quality={100}
                    priority
                    fill
                    alt="AniverseHD"
                    className="text-xl font-bold "
                  />
                </div>
              </Link>
              {/* <h1 className="text-xl font-bold ">AniverseHD</h1> */}
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                <Link
                  href="/"
                  className=" hover:text-white px-2  rounded-md text-md font-light"
                >
                  Home
                </Link>
                <Link
                  href="/catalog"
                  className=" hover:text-white px-2  rounded-md text-md font-light"
                >
                  Catalog
                </Link>
                <Link
                  href="/recommendations"
                  className=" hover:text-white px-2  rounded-md text-md font-light"
                >
                  Recommendations
                </Link>

                <Link
                  href="/report-bug"
                  className=" hover:text-white px-2 text-nowrap flex rounded-md text-md font-light"
                >
                  Report Bug
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center  flex-row-reverse md:flex-row md:gap-8">
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
              <div
                className={`w-80 transition-all duration-200 transform ${
                  searchOpen
                    ? "translate-x-0 opacity-100 visible"
                    : "-translate-x-full opacity-0 invisible"
                } md:block hidden`}
              >
                <SearchComponent />
              </div>
              <button onClick={() => setSearchOpen(!searchOpen)}>
                <FaSearch
                  className={`${
                    searchOpen ? "text-sky-500" : "text-[whitesmoke]"
                  } md:block hidden`}
                  size={20}
                />
              </button>
            </div>

            
            {!isUserLoggedIn ? (
              <button
                className=" bg-primary-200 md:block  text-gray-800 md:font-semibold hover:bg-primary-100 md:px-5 md:py-1.5 p-1 mx-3 px-2 text-sm md:text-base rounded-lg text-md "
                onClick={handleSignIn}
              >
                Login
              </button>
            ) : (
              <DropDownNavbarUserAvatar />
            )}
          </div>
        </div>
      </div>

      {/* //? MOBILE VIEW IS FROM BELOW */}
      <div className={`${isOpen ? "flex" : "hidden"} md:hidden w-full overflow-hidden`}>
        <div className="px-2 pt-5 pb-3 space-y-1 w-full flex flex-col gap-4  sm:px-1">
        <div className="relative w-[80%] m-2">
            <SearchComponent />
          </div>
          <Link
            href="/"
            className=" hover:text-white block px-3  rounded-md text-base font-medium"
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-white block px-3 rounded-md text-base font-medium"
          >
            Catalog
          </Link>
          <Link
            href="/recommendations"
            className=" hover:text-white block px-3 rounded-md text-base font-medium"
          >
            Recommendations
          </Link>

          <Link
            href="/report-bug"
            className=" hover:text-white block px-3 rounded-md text-base font-medium"
          >
            Report Bug
          </Link>
          
          {!isUserLoggedIn && <button
            className="md:w-full block bg-primary-200 !my-3  mx-2 rounded-lg text-gray-800 w-1/6 justify-center hover:bg-primary-100 px-3 py-2  text-sm font-medium"
            onClick={handleSignIn}
          >
            Login
          </button>}
        </div>
      </div>
    {isUserLoggedIn  && <WatchlistBar  />}
    </nav>

    </>
  );
};

export default Navbar;
