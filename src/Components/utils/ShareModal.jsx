"use client"
import { useEffect, useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
  RedditShareButton,
  RedditIcon,
  TelegramShareButton,
  TelegramIcon,
} from 'react-share';
import {  FaShareSquare } from "react-icons/fa";
import { IoCopy } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAbsoluteURLPath } from '@/app/watch/[id]/utilFunctions';

const ShareModal = ({ 
                      url, 
                      buttonText = "", 
                      modalTitle = "Share this Anime", 
                      title="Checkout this Amazing Anime",
                      t,
                      big
                    }) => {

    const iconSize = 40;
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(false);
    const [fullURL, setFullURL] = useState(url);
    

    const closeModal = () => setIsOpen(false);

    useEffect(()=>{
        console.log("This is timestamp recieved by shareModal", t);
      if(!url){
        const path = window.location.origin + getAbsoluteURLPath(pathname, searchParams);
        setFullURL(t ? path + `&t=${t}` : path);
        // console.log(fullURL);
      }
    }, [[url, pathname, searchParams, t]]);



  const handleOnCopy = ()=>{
    navigator.clipboard.writeText(fullURL);
    toast.success("Link Copied to Clipboard");
  }

  return (
    <div className='flex items-center max-w-screen-lg'>
      {/* Dynamic button */}
      <div className="button flex mx-2 cursor-pointer items-center my-auto gap-[0.15rem] " onClick={()=> setIsOpen(true)}>
        <FaShareSquare className={`text-primary-300 md:text-base ${big ? "!text-2xl" : "text-2xl"}`}/> 
        {buttonText}

      </div>


      {/* Modal */}
      {isOpen && fullURL && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center z-50"
          onClick={closeModal} // Close modal on clicking the overlay
        >
            <div className="img  bg-recommendation-box-banne bg-center bg-cover  rounded-lg overflow-hidden flex flex-col gap-2  md:w-1/2 w-5/6 md:h-80 h-96 items-center shadow-lg">
          <div
            className="bg-cbg-100/100 backdrop-blur-sm my-auto flex flex-col w-full h-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing on clicking inside the modal
          >
            <div className='w-full flex flex-col my-auto p-3'>
            <h2 className="text-xl font-semibold mb-4 text-center">{modalTitle}</h2>

            <div className="copyText flex mx-auto self-center justify-between md:w-1/2 w-full items-center gap-4">
            <label type="text" name="" id="" value={fullURL} disabled={true} className=' text-ellipsis rounded-md whitespace-nowrap bg-gray-500 text-sm overflow-hidden my-3 w-full /4 px-2 py-1' >{fullURL}</label>
            <IoCopy className='text-2xl text-primary-300 cursor-pointer hover:scale-110 ease-in duration-100' onClick={handleOnCopy}/>
           

            </div>
            <div className="flex flex-wrap justify-center gap-4 my-6">
              {/* Facebook */}
              
              {/* Email */}
              <EmailShareButton url={fullURL} subject={title} body="Check this out!">
                <EmailIcon size={iconSize} round />
              </EmailShareButton>

              {/* WhatsApp */}
              <WhatsappShareButton url={fullURL} title={title}>
                <WhatsappIcon size={iconSize} round />
              </WhatsappShareButton>

              {/* Telegram */}
              <TelegramShareButton url={fullURL} title={title}>
                <TelegramIcon size={iconSize} round />
              </TelegramShareButton>
              
              {/* LinkedIn */}
              <LinkedinShareButton url={fullURL} title={title}>
                <LinkedinIcon size={iconSize} round />
              </LinkedinShareButton>


              {/* Reddit */}
              <RedditShareButton url={fullURL} title={title}>
                <RedditIcon size={iconSize} round />
              </RedditShareButton>


              
              <FacebookShareButton url={fullURL} quote={title}>
                <FacebookIcon size={iconSize} round />
              </FacebookShareButton>
              
              {/* Twitter */}
              <TwitterShareButton url={fullURL} title={title}>
                <TwitterIcon size={iconSize} round />
              </TwitterShareButton>
            </div>
            <button
              className="bg-cbg-300 rounded-full translate-y-4 text-white p-2 w-10 items-center justify-center mx-auto hover:bg-cbg-400 ease-in-out duration-150 hover:scale-110"
              onClick={closeModal}
            >
              ❌
            </button>
            </div>
          </div>
          </div>
        </div>
      )}
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
  );
};

export default ShareModal;
