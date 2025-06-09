import React, { useState, useRef, useEffect } from "react";
import { IoMdNotifications, IoMdClose } from "react-icons/io";
import {
  FaCheck,
  FaUser,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { CustomTimeAgo } from "./utils/timeago";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      notification_id: 8,
      recipient_user_id: "JsnQAAJn2oeq8S5185iwQyu5cw12",
      module: "COMMENT",
      action: "REPLIED",
      metadata: {
        animeId: "58567",
        epNo: 1,
        zoroEpId:
          "solo-leveling-season-2-arise-from-the-shadow-19413?ep=131394",
        body: "Jai Shree Ram",
        parentCommentId: 4,
        repliedBy: "Gojo 2.0",
      },
      action_user: "JsnQAAJn2oeq8S5185iwQyu5cw12",
      is_read: 0,
      created_at: "2025-06-06 17:39:19",
    },
    {
      notification_id: 4,
      recipient_user_id: "JsnQAAJn2oeq8S5185iwQyu5cw12",
      module: "COMMENT",
      action: "REPLIED",
      metadata: {
        animeId: "58567",
        epNo: 1,
        zoroEpId:
          "solo-leveling-season-2-arise-from-the-shadow-19413?ep=131394",
        body: "Vande Matram",
        parentCommentId: 1,
        repliedBy: "",
      },
      action_user: "JsnQAAJn2oeq8S5185iwQyu5cw12",
      is_read: 0,
      created_at: "2025-06-06 17:20:02",
    },
  ]);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unread notifications count
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Mark individual notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.notification_id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true }))
    );
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

  const getNotificationTitle = (notification) => {
    switch (notification.module) {
      case "COMMENT":
        return (
          notification.action === "REPLIED" ??
          `New reply from ${notification.metadata.repliedBy || "Unknown"}`
        );
      // case 'warning':
      //     return 'Warning'
      // case 'success':
      //     return 'Success'
      // case 'info':
      //     return 'Information'
      default:
        return "Notification";
    }
  };

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
        <div className="absolute top-full right-0 mt-2 w-96 bg-cbg-100 rounded-lg shadow-xl border border-gray-600 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary-200">
            <h3 className="text-lg font-semibold text-primary-300">
              Notifications ({unreadCount} unread)
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-sky-500 hover:text-sky-300 font-medium"
                >
                  Mark all read
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
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <IoMdNotifications className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-400  transition-colors ${
                    !notification.is_read
                      ? "bg-cbg-200 border-l-4 border-l-cbg-500"
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
                        <div className="flex-1">
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
                                  notification.metadata.repliedBy || "Unknown"
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
                            {notification.metadata.body ||
                              "No details available"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            <CustomTimeAgo
                              date={new Date(notification?.created_at + "Z")}
                            />
                          </p>
                        </div>

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
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 bg-gray-800">
              <button className="w-full text-center text-sm text-gray-300 hover:text-gray-200 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
