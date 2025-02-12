"use client";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const Notice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const message = process.env.NEXT_PUBLIC_NOTICE || "";
  const bgColor = process.env.NEXT_PUBLIC_NOTICE_BG_COLOR || "#333";

  useEffect(() => {
    const noticeRemoved = sessionStorage.getItem("noticeRemoved") === "true";
    setIsVisible(process.env.NEXT_PUBLIC_NOTICE_VISIBLE === "true" && !noticeRemoved);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("noticeRemoved", "true");
    setIsVisible(false);
  };

  if (!isVisible || !message) return null;

  return (
    <div className={`w-full text-white text-center text-sm py-2 relative z-50 flex justify-between items-center px-4`}
    style={{ backgroundColor: bgColor }}
    >
      <span className="flex-1">{message}</span>
      <button onClick={handleClose} className="text-white hover:opacity-75 transition-opacity">
        <AiOutlineClose size={18} />
      </button>
    </div>
  );
};

export default Notice;
