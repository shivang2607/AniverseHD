//new code of navbar as recommended by deepseek


"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX, HiChevronDown, HiSparkles, HiHome } from "react-icons/hi";
import { FaSearch, FaComments, FaPoll, FaLightbulb, FaRegStar } from "react-icons/fa";
import { GrCatalog } from "react-icons/gr";
import { VscFeedback } from "react-icons/vsc";
import { FiMoreHorizontal } from "react-icons/fi";
import SearchComponent from "./recommendationPanel/SearchComponent";
import { usePathname } from "next/navigation";
import Image from "next/image";
import DropDownNavbarUserAvatar from "./DropDownNavbarUserAvatar";
import useUserStore from "./ZustandStores/userStore";
import WatchlistBar from "./WatchlistBar";
import useGlobalLoader from "./ZustandStores/useGlobalLoader";
import { Constant_Var_localstorage_version } from "@/utils/constants";

const Navbar = () => {
  const { isUserLoggedIn, login, loadLoggedInUserDataAndWatchLists, RecentWatchListId, loadLoggedInUserRecentWatchList, hideWatchlistBar } = useUserStore();
  const router = useRouter();
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { setLoaderText, setIsLoaderVisible, setImageUrl } = useGlobalLoader();


  const navbarItems = [
    { href: "/", name: "Home", icon: <HiHome className="text-base" /> },
    { href: "/catalog", name: "Catalog", icon: <GrCatalog className="text-base" /> },
    { href: "/recommendations", name: "Recommendations", icon: <HiSparkles className="text-base" /> },
  ]

  // Additional navigation items for the "More" dropdown
  const moreItems = [
    { href: "/discussions", name: "Discussions", icon: <FaComments className="mr-2" /> },
    { href: "/polls", name: "Polls", icon: <FaPoll className="mr-2" /> },
    { href: "/upcoming", name: "Upcoming Features", icon: <FaLightbulb className="mr-2" /> },
    { href: "/feature-request", name: "Feature Request", icon: <FaRegStar className="mr-2" /> },
  ];

  const handleSignIn = async () => {
    setIsLoaderVisible(true);
    setImageUrl("/userProfileImage7.jpg");
    await login((status) => setLoaderText(status));
    setIsLoaderVisible(false);
    setLoaderText(null);
    setImageUrl(null);
  };

  const handleScroll = () => {
    if (["/recommendations"].some((path) => path === currentPath)) return;
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && !isScrollingUp) {
      setShowNavbar(false);
    } else if (currentScrollY < lastScrollY && isScrollingUp) {
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isScrollingUp]);

  useEffect(() => {
    setShowNavbar(true);
    setIsOpen(false);
  }, [currentPath]);

  useEffect(() => {
    loadLoggedInUserDataAndWatchLists();
  }, []);

  useEffect(() => {
    if (RecentWatchListId) loadLoggedInUserRecentWatchList();
  }, [RecentWatchListId]);

  useEffect(() => {
    const localstorage_version = localStorage.getItem("version");
    if (!localstorage_version || localstorage_version !== Constant_Var_localstorage_version) {
      localStorage.clear();
      localStorage.setItem("version", Constant_Var_localstorage_version);
      sessionStorage.clear();
    }
  }, []);

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-transform duration-300 backdrop-blur-lg border-b border-primary-100/20 ${showNavbar ? "translate-y-0" : "-translate-y-full"} ${isBackgroundVisible ? "bg-cbg-100/95" : "bg-cbg-100/80"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
          <div className="flex items-center  h-16">
            {/* Logo Section */}
            <Link href="/" className="flex mx-2 items-center space-x-2 group flex-shrink-0">
              <div className="relative w-36 h-12">
                <Image
                  src="/logo-primary.png"
                  alt="AniverseHD"
                  fill
                  className="object-contain transition-transform duration-200 hover:scale-105"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-1 max-w-2xl mx-4">
              <div className="flex space-x-3">
                {navbarItems.map(item=>{
                  return (
                    <Link
                    key={item.href}
                  href={item.href}
                  className={`px-3 py-2 flex gap-1 items-center rounded-md text-sm font-medium transition-colors ${currentPath === item.href ? "text-primary-200 bg-primary-100/10" : "text-gray-300 hover:text-primary-200 hover:bg-primary-100/5"}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
                  )
                })}
                
		{/* More Dropdown */}
    {/* //TODO: Below section will be uncommented when more features will be added */}
                {/* <div className="relative">
                  <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isMoreOpen ? "text-primary-200 bg-primary-100/10" : "text-gray-300 hover:text-primary-200 hover:bg-primary-100/5"
                    }`}
                  >
                    <FiMoreHorizontal className="mr-1" />
                    More
                    <HiChevronDown className={`ml-1 transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isMoreOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-lg bg-cbg-200 border border-primary-100/20">
                      <div className="py-1">
                        {moreItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary-200 hover:bg-primary-100/10 transition-colors"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div> */}

              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              <div className="relative hidden md:flex items-center">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`p-2 rounded-lg transition-colors z-10 ${
                    searchOpen ? "text-primary-200 bg-primary-100/10" : "text-gray-300 hover:bg-primary-100/5"
                  }`}
                >
                  <FaSearch className="w-5 h-5" />
                </button>
                
                <div className={`absolute right-10 flex items-center transition-all duration-300 origin-right ${
                  searchOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-4"
                }`}>
                  <div className="mx-2 w-80 rounded-lg  bg-cbg-200 shadow-lg">
                    <SearchComponent />
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <Link
                href="/feedback-bug"
                className="hidden md:inline-flex gap-1 items-center px-4 py-2 text-sm font-medium text-primary-200 rounded-lg hover:bg-primary-100/10 transition-colors"
              >
                <VscFeedback className="text-base"/>
                Feedback
              </Link>

              {/* Auth Section */}
              {!isUserLoggedIn ? (
                <button
                  onClick={handleSignIn}
                  className="px-5 py-2 bg-primary-200 text-cbg-100 rounded-lg font-medium hover:bg-primary-300 transition-colors shadow-sm"
                >
                  Login
                </button>
              ) : (
                <DropDownNavbarUserAvatar />
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-primary-200 hover:bg-primary-100/10 transition-colors"
              >
                {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (keep existing mobile code) */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-screen" : "max-h-0"}`}>
          <div className="px-4 pt-2 pb-4 space-y-1 border-t border-primary-100/10">
          <div className=" pt-4 w-full">
              <div className="rounded-lg border border-primary-100/20 bg-cbg-100 p-2">
                <SearchComponent />
              </div>
            </div>
          {navbarItems.map(item => {
            return (
              <Link key={item.href} href={item.href} className=" px-3 py-2 rounded-md text-base font-medium text-gray-300 flex items-center gap-1 hover:text-primary-200 hover:bg-primary-100/10">
                {item.icon}
                {item.name}
            </Link>
            )
          })}
           
            <Link href="/feedback-bug" className="flex items-center gap-1 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-primary-200 hover:bg-primary-100/10">
            <VscFeedback className="text-base"/>
              Feedback
            </Link>

            {/* //TODO: Below section will be uncommented when more features will be added */}
		{/* {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-primary-200 hover:bg-primary-100/10"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))} */}
            
          </div>
        </div>
      {isUserLoggedIn && <WatchlistBar />}
      </nav>

    </>
  );
};

export default Navbar;
