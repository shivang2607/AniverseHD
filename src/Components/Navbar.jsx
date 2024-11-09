"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import SearchComponent from "./recommendationPanel/SearchComponent";
import { FaSearch } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Image from "next/image";
import SignInGooglePopUp from "@/app/firebase/SignIn/SignInGooglePopUp";
import { Constant_Var_success } from "@/utils/constants";
import GetLoggedUserData from "@/app/firebase/Profile/GetLoggedUserData";
import DropDownNavbarUserAvatar from "./DropDownNavbarUserAvatar";
import AddAnimeToWatchList from "@/app/firebase/WatchList/UpdateWatchLists/AddAnimeToWatchList";
import useUserStore from "./ZustandStores/userStore";
import GetWatchListById from "@/app/firebase/WatchList/WatchListAnimeList/GetWatchListById";

const Navbar = () => {
  const { isUserLoggedIn, login, loadLoggedInUserDataAndWatchLists} = useUserStore();
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

  const handleSignIn = async () => {
    login();
  };

  const test = async () => {
  //  setIsUserLoggedIn(true);
    const res=await GetWatchListById({watchListId:"IPEFfE9vqwpDs0A2Bcrs",offset:10,pageSize:2});
    console.log(res.response,res.status);
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
 

  return (
    <nav
      className={`${
        ["/recommendations"].some((path) => path === currentPath)
          ? "static"
          : "fixed"
      } py-1 border-b-[1px] border-b-primary-100 w-full z-20 transition-transform duration-300 backdrop-blur-sm ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } ${isBackgroundVisible ? "bg-black/30" : "bg-opacity-0"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex w-full items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="logo relative w-52 h-10">
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
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className=" hover:text-white px-3  rounded-md text-md font-light"
                >
                  Home
                </Link>
                <Link
                  href="/catalog"
                  className=" hover:text-white px-3  rounded-md text-md font-light"
                >
                  Catalog
                </Link>
                <Link
                  href="/recommendations"
                  className=" hover:text-white px-3  rounded-md text-md font-light"
                >
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

            <button
              className=" bg-primary-200 md:block hidden text-gray-800 font-semibold hover:bg-primary-100 px-5 py-1.5 rounded-lg text-md "
              onClick={test}
            >
              test
            </button>
            {!isUserLoggedIn ? (
              <button
                className=" bg-primary-200 md:block hidden text-gray-800 font-semibold hover:bg-primary-100 px-5 py-1.5 rounded-lg text-md "
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
      <div className={`${isOpen ? "flex" : "hidden"} md:hidden w-full`}>
        <div className="px-2 pt-2 pb-3 space-y-1 w-full  sm:px-1">
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
          <div className="relative w-[80%] m-2">
            <SearchComponent />
          </div>
          <button
            className="md:w-full block bg-primary-200 !my-3  mx-2 rounded-lg text-gray-800 w-1/6 justify-center hover:bg-primary-100 px-3 py-2  text-sm font-medium"
            onClick={handleSignIn}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
