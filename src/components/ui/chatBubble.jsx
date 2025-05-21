import React from "react";
import ProfileIcon from "./profileIcon";

export default function chatBubble({
  username = "username",
  message = "message",
  isSent,
  profilePic = "https://www.dummyimage.com/25x25/000/fff",
}) {
  return (
    <div className="mb-4">
      {/* Username display */}
      <div className={`mb-1 ${isSent ? "text-right" : "text-left"}`}>
        <p className="text-sm">{username}</p>
      </div>

      {/* Chat bubble with profile icon */}
      <div className={`flex items-center ${isSent ? "flex-row-reverse" : ""}`}>
        <div className={`flex-shrink-0 ${isSent ? "ml-2" : "mr-2"}`}>
          <ProfileIcon profilePic={profilePic} size={40} />
        </div>
        <div
          className={`${
            isSent ? "bg-gray-300" : "bg-gray-200"
          } rounded-3xl px-4 py-2 max-w-xs`}
        >
          <p className="text-gray-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
