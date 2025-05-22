import React from "react";
import ProfileIcon from "./profileIcon";

export default function GlassMessageCard({
  username = "username",
  time,
  lastMessage,
  unread = true,
  profilePic = "https://www.dummyimage.com/50x50/000/fff",
}) {
  return (
    <div className="glass-card" style={{marginBottom: "10px", padding: "12px", animation: "none", opacity: 1, transform: "none"}}>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white border-opacity-30 flex-shrink-0">
          <ProfileIcon profilePic={profilePic} />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex justify-between items-center">
            <span className={`font-medium text-white ${unread ? "font-bold" : ""}`}>
              {username}
            </span>
            <span className="text-xs text-white text-opacity-70">{time}</span>
          </div>
          <p className={`mt-1 text-white text-opacity-80 ${unread ? "font-semibold" : ""}`}>
            {lastMessage}
          </p>
        </div>
        {unread && (
          <div className="ml-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
}