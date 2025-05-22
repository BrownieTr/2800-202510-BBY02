import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const { getAccessTokenSilently } = useAuth0();
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread message notifications
  const fetchUnreadMessages = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:3000/api/notifications/messages/unread", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUnreadMessages(data.notifications || []);
      setUnreadCount(data.notifications.length);
    } catch (error) {
      console.error("Error fetching message notifications:", error);
    }
  };

  // Mark a message notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`http://localhost:3000/api/notifications/messages/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update local state after marking as read
      setUnreadMessages(unreadMessages.filter(notif => notif._id !== notificationId));
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = async () => {
    if (!isOpen) {
      await fetchUnreadMessages();
    }
    setIsOpen(!isOpen);
  };

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

  // Fetch notifications on component mount
  useEffect(() => {
    fetchUnreadMessages();
    
    // Polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-center relative"
        onClick={toggleDropdown}
        aria-label="Message notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="py-2 px-3 bg-gray-100 border-b">
            <h3 className="text-sm font-medium">Messages</h3>
          </div>
          
          {unreadMessages.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No new messages
            </div>
          ) : (
            <div>
              {unreadMessages.map((notification) => (
                <Link
                  key={notification._id}
                  to={`/chat/${notification.conversationID}`}
                  className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img 
                        src={notification.senderProfilePic || "https://www.dummyimage.com/40x40/000/fff"} 
                        alt={notification.senderName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.senderName}</p>
                      <p className="text-xs text-gray-500 truncate">{notification.preview}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="p-2 text-center border-t">
            <Link to="/messages" className="text-xs text-blue-500 hover:text-blue-700">
              See all messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
