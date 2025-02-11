"use client"
import { useEffect, useState } from "react";

const Notice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const message = process.env.NEXT_PUBLIC_NOTICE || "";

  useEffect(() => {
    setIsVisible(process.env.NEXT_PUBLIC_NOTICE_VISIBLE === "true");
  }, []);

  if (!isVisible || !message) return null;

  return (
    <div className="w-full bg-red-600 text-white text-center text-sm py-2 z-50">
      {message}
    </div>
  );
};

export default Notice;
