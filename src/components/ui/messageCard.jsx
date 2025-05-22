import React from "react";
import ProfileIcon from "./profileIcon";

export default function messageCard({
  username = "username",
  time,
  lastMessage,
  unread = false,
  profilePic = "https://www.dummyimage.com/50x50/000/fff",
}) {
  return (
    <button className={`w-full text-left`}>
      <div className="flex items-center py-2 px-3">
        <div className="w-10 h-10 rounded-full flex-shrink-0">
          <ProfileIcon profilePic={profilePic} />
        </div>
        <div className="ml-3 flex-grow">
          <div className="flex justify-between items-center">
            <span className={`font-medium text-sm ${unread ? "font-bold" : ""}`}>
              {username}
            </span>
            <span className="text-xs">{time}</span>
          </div>
          <p className={`text-xs mt-1 ${unread ? "font-semibold" : ""}`}>
            {lastMessage}
          </p>
        </div>
        {unread && (
          <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    </button>
  );
}
