//new code of navbar as recommended by deepseek


"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX, HiChevronDown, HiSparkles, HiHome } from "react-icons/hi";
import { FaSearch, FaComments, FaPoll, FaLightbulb, FaRegStar } from "react-icons/fa";
import { GrCatalog } from "react-icons/gr";
import { VscFeedback } from "react-icons/vsc";
import { SiDiscord } from "react-icons/si";
import { FiMoreHorizontal } from "react-icons/fi";
import SearchComponent from "./recommendationPanel/SearchComponent";
import { usePathname } from "next/navigation";
import Image from "next/image";
import DropDownNavbarUserAvatar from "./DropDownNavbarUserAvatar";
import useUserStore from "./ZustandStores/userStore";
import WatchlistBar from "./WatchlistBar";
import useGlobalLoader from "./ZustandStores/useGlobalLoader";
import { Constant_Var_localstorage_version } from "@/utils/constants";
import Notice from "./Notice";
import { SiUtorrent } from "react-icons/si";
import ThemeSwitcher from "./ThemeSwitcher";
import Notifications from "./Notifications";

const Navbar = () => {
  const { isUserLoggedIn, login, loadLoggedInUserDataAndWatchLists, RecentWatchListId, loadLoggedInUserRecentWatchList, loggedInUserId, hideWatchlistBar } = useUserStore();
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
    // { href: "/torrent", name: "Torrent", icon: <SiUtorrent className="text-base" />, new: true },
  ]

  // Additional navigation items for the "More" dropdown
  const moreItems = [
    // { href: "", name: "Theme", icon: <></>, new: true },
    // { href: "/discussions", name: "Discussions", icon: <FaComments className="mr-2" /> },
    // { href: "/polls", name: "Polls", icon: <FaPoll className="mr-2" /> },
    // { href: "/upcoming", name: "Upcoming Features", icon: <FaLightbulb className="mr-2" /> },
    { href: "/torrent", name: "Torrent", icon: <SiUtorrent className="text-base mr-2" />, new: true },
    { href: "/feedback-bug", name: "Feedback", icon: <VscFeedback className="text-base mr-2" />, new: false },
    // { href: "/feature-request", name: "Feature Request", icon: <FaRegStar className="mr-2" /> },

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
        <Notice />
        <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-2">
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
  className={`px-3 py-2 flex gap-1 items-center rounded-md z-30 text-sm font-medium transition-colors ${
    currentPath === item.href
      ? "text-primary-200 bg-primary-100/10"
      : "text-gray-300 hover:text-primary-200 hover:bg-primary-100/5"
  }`}
>
  {item.icon}
  <span className="relative">
    {item.name}
    {item.new && (
      <span className="absolute -top-4 animate-pulse -right-6 bg-sky-500 text-white text-[0.65rem] px-1 rounded-lg font-bold  transform scale-75">
        NEW
      </span>
    )}
  </span>
</Link>
                  )
                })}
                
		{/* More Dropdown */}
    {/* //TODO: Below section will be uncommented when more features will be added */}
                <div className="relative">
                  <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`flex z-30 items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                      <ThemeSwitcher/>
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
                </div>

              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              <div className="relative hidden md:flex  items-center">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`p-2 rounded-lg transition-colors z-10 ${
                    searchOpen ? "text-primary-200 bg-primary-100/10" : "text-gray-300 hover:bg-primary-100/5"
                  }`}
                >
                  <FaSearch className="w-5 h-5" />
                </button>

                
                <div className={`absolute right-10 flex items-center transition-all duration-300 origin-right ${
                  searchOpen ? "opacity-100 scale-100 z-30 translate-x-0" : "opacity-0 scale-95 -z-10 translate-x-4"
                }`}>
                  <div className="mx-2 w-80 rounded-lg  bg-cbg-200 shadow-lg">
                    <SearchComponent isOpen={searchOpen}/>
                  </div>
                </div>
              </div>

               {/* Discord invite link */}
               <Link
                  href="https://discord.gg/AkmasG4xGa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative cursor-pointer group text-xl bg-[#5865F2] rounded-full items-center flex p-2 mx-1"
                >
                  <SiDiscord className="text-white" />
                  <span className="absolute left-1/2 w-36 -translate-x-1/2 -bottom-8 cursor-pointer z-30 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[0.65rem] leading-tight px-2 py-1 rounded-md transition-opacity">
                    Join our Discord server now!
                  </span>
                </Link>


                {isUserLoggedIn && <Notifications loggedInUserId = {loggedInUserId}/>}



              {/* Feedback */}
              {/* <Link
                href="/feedback-bug"
                className="hidden md:inline-flex gap-1 items-center px-2 py-2 text-sm font-medium text-primary-200 rounded-lg hover:bg-primary-100/10 transition-colors"
              >
                <VscFeedback className="text-base"/>
                Feedback
              </Link> */}

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
        <div className={`md:hidden z-40 overflow-hidden transition-all duration-300 ${isOpen ? "h-[60vh]" : "max-h-0"}`}>
          <div className="px-4 pt-2 pb-4 space-y-1 z-30 border-t border-primary-100/10">
          <div className=" pt-4 w-full">
              <div className=" rounded-lg border border-primary-100/20 bg-cbg-100 p-2">
                <SearchComponent />
              </div>
            </div>
          {navbarItems.map(item => {
            return (
              <Link key={item.href} href={item.href} className=" px-3 py-2 rounded-md text-base font-medium text-gray-300 flex items-center gap-1 hover:text-primary-200 hover:bg-primary-100/10">
                {item.icon}
                {item.name}
                {item.new && (
      <span className=" flex animate-pulse  bg-sky-500 text-white text-[0.65rem] px-1 rounded-lg font-bold  transform scale-75">
        NEW
      </span>
    )}
            </Link>
            )
          })}
           
            <Link href="/feedback-bug" className="flex items-center gap-1 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-primary-200 hover:bg-primary-100/10">
            <VscFeedback className="text-base"/>
              Feedback
            </Link>

            {/* //TODO: Below section will be uncommented when more features will be added */}
            <ThemeSwitcher/>
		{moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-primary-200 hover:bg-primary-100/10"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
          </div>
        </div>
      {isUserLoggedIn && <WatchlistBar />}
      </nav>

    </>
  );
};

export default Navbar;
