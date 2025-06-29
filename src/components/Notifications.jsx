import React, { useState, useRef, useEffect, useCallback } from "react";
import { IoMdNotifications, IoMdClose } from "react-icons/io";
import {
  FaCheck,
  FaUser,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { CustomTimeAgo } from "./utils/timeago";
import axios from "axios";
import toast from "react-hot-toast";
import { getSessionWithExpiry, setSessionWithExpiry } from "./utils/storage";
import { Oval, ThreeDots } from "react-loader-spinner";
import Link from "next/link";

export default function Notifications({loggedInUserId}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    markAllReadLoading: false,
    notificationsLoading: false,
  })

  const dropdownRef = useRef(null);

  // Parse notification metadata with error handling
  const parseMetadata = useCallback((metadata) => {
    try {
      if (typeof metadata === 'string') {
        return JSON.parse(metadata);
      }
      return metadata || {};
    } catch (error) {
      console.warn('Failed to parse notification metadata:', error);
      return {};
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);

    //fetch the notifications when the component mounts
    (async ()=>{
      await fetchNotifications();
    })();
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //useEffect to fetch the notifications
  useEffect(() => {
    (async () => {
      if(!isOpen) return;
      await fetchNotifications();
    })();
  }, [isOpen]);


  async function fetchNotifications(){
    try {
      setLoadingStates((prev) => ({ ...prev, notificationsLoading: true }));
      if(getSessionWithExpiry(`notifications`)){
        setNotifications(getSessionWithExpiry(`notifications`));
        setLoadingStates((prev) => ({ ...prev, notificationsLoading: false }));
        return;
      }
      const response = await axios.get('/api/v1/notifications', {
        headers: {"user-id": loggedInUserId,},
        params: {
          getAll: true, // Fetch all notifications
          limit: 20, // Limit to 100 notifications
        },
      });
      if(response?.data?.success){
        setNotifications(response?.data?.results || []);  
        setSessionWithExpiry(`notifications`, response?.data?.results || [], 1000 * 60 * 10);
      }
      else{
        toast.error("Failed to fetch Notifications", {id: "fetch-notifications-error",duration: 3000,});
      }
      setLoadingStates((prev) => ({ ...prev, notificationsLoading: false }));
      
    } catch (error) {
      toast.error("Error fetching notifications", {id: "fetch-notifications-error",duration: 3000,});
      setLoadingStates((prev) => ({ ...prev, notificationsLoading: false }));
      
    }
   
  }

  async function markAllAsRead() {
    try {
      setLoadingStates((prev) => ({ ...prev, markAllReadLoading: true }));
      const response = await axios.put('/api/v1/notifications', {}, {
        headers: { "user-id": loggedInUserId },
      });
      if (response?.data?.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, is_read: true }))
        );
        setSessionWithExpiry(`notifications`, response?.data?.results || [], 1000 * 60 * 10);
      } else {  
        toast.error("Failed to mark all notifications as read", {
          id: "mark-all-read-error",
          duration: 3000,
        });
      }
      setLoadingStates((prev) => ({ ...prev, markAllReadLoading: false }));
    } catch (error) {
      toast.error("Error marking all notifications as read", {
        id: "mark-all-read-error",
        duration: 3000,
      });
      setLoadingStates((prev) => ({ ...prev, markAllReadLoading: false }));
    }
  }


  // Get unread notifications count
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Mark individual notification as read
  const markAsRead = async (id) => {
    
    const res = await axios.put('/api/v1/notifications', { notificationId: id }, {
      headers: { "user-id": loggedInUserId },
    });
    if (res?.data?.success) {
      setSessionWithExpiry(`notifications`, res?.data?.results || [], 1000 * 60 * 10);
      setNotifications((prev) =>
      prev.map((notification) =>
        notification.notification_id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
    }
    else {
      toast.error("Failed to mark notification as read", {
        id: "mark-read-error",
        duration: 3000,
      });
    }

  };

  // Get icon based on notification type
  const getNotificationIcon = (module) => {
    switch (module) {
      case "COMMENT":
        return <FaUser className="text-sky-500" />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "success":
        return <FaCheck className="text-green-500" />;
      case "info":
        return <FaInfoCircle className="text-sky-400" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getNotificationTitle = useCallback((notification) => {
    const metadata = parseMetadata(notification.metadata);
    switch (notification.module) {
      case "COMMENT":
        return (
          notification.action === "REPLIED" ??
          `New reply from ${metadata.repliedBy || "Unknown"}`
        );
      default:
        return "Notification";
    }
  }, [parseMetadata]);


  const generateUrl = useCallback((notification) => {
    if (!notification || !notification.url) {
      return "#";
    }
    const metadata = parseMetadata(notification.metadata);
    switch (notification.module) {
      case "COMMENT":
        return `${notification.url}#comment-${metadata.parentCommentId}`;
      case "LIKE":
        return `/posts/${metadata.postId}`;
      
      default:
        return "#";
    }
  }, [parseMetadata]);

  return (
    <div className="relative flex" ref={dropdownRef}>
      {/* Notification Icon */}
      <div className="relative">
        <IoMdNotifications
          className="text-3xl text-primary-400 cursor-pointer mx-2 hover:text-primary-500 transition-colors"
          onClick={toggleDropdown}
        />
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-cbg-200 rounded-lg shadow-xl border border-gray-600 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary-200">
            <h3 className="text-lg font-semibold text-primary-300">
              Notifications ({unreadCount} unread)
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={async()=> await markAllAsRead()}
                  disabled={loadingStates.markAllReadLoading}
                  className="text-sm text-sky-500 hover:text-sky-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingStates.markAllReadLoading ? (
                    <>
                      <ThreeDots
                        height="16"
                        width="16"
                        radius="9"
                        color="#0ea5e9"
                        ariaLabel="three-dots-loading"
                      />
                      <span>Marking...</span>
                    </>
                  ) : (
                    "Mark all read"
                  )}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-200 hover:text-gray-700 transition-colors"
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
            {loadingStates.notificationsLoading ? (
              // Loading state for notifications
              <div className="flex flex-col items-center justify-center p-8">
                <Oval
                  height={40}
                  width={40}
                  color="#0ea5e9"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                  ariaLabel='oval-loading'
                  secondaryColor="#0ea5e9"
                  strokeWidth={2}
                  strokeWidthSecondary={2}
                />
                <p className="text-gray-400 mt-3">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <IoMdNotifications className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const metadata = parseMetadata(notification.metadata);
                const url = generateUrl(notification);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-400  transition-colors ${
                      !notification.is_read
                        ? "bg-cbg-100 border-l-4 border-l-cbg-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.module)}
                      </div>

                      {/* Notification Content */}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <Link href={url} onClick={toggleDropdown} className="flex-1">
                            <h4
                              className={`text-sm title font-semibold ${
                                !notification.is_read
                                  ? "text-gray-300"
                                  : "text-gray-400"
                              }`}
                            >
                              {getNotificationTitle(notification)}
                              {notification.module === "COMMENT"
                                ? `New reply from ${
                                    metadata.repliedBy || "Unknown"
                                  }`
                                : `Notification from ${notification.module}`}
                            </h4>
                            <p
                              className={`body text-sm line-clamp-1 mt-1 ${
                                !notification.is_read
                                  ? "text-gray-300"
                                  : "text-gray-400"
                              }`}
                            >
                              {metadata.body || "No details available"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              <CustomTimeAgo
                                date={new Date(notification?.created_at + "Z")}
                              />
                            </p>
                          </Link>

                          {/* Mark as Read Button */}
                          {!notification.is_read && (
                            <button
                              onClick={() =>
                                markAsRead(notification.notification_id)
                              }
                              className="flex-shrink-0 ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="Mark as read"
                            >
                              <FaCheck className="text-xs" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}

          {/* //commenting view all notifications because we dont have notifications page yet */}
          {/* {notifications.length > 0 && !loadingStates.notificationsLoading && (
            <div className="p-3 border-t border-gray-800 bg-gray-800">
              <button className="w-full text-center text-sm text-gray-300 hover:text-gray-200 font-medium">
                View all notifications
              </button>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}