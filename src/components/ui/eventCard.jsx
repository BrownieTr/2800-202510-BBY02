import React from "react";
import ProfileIcon from "./profileIcon";
import ClickableIcons from "./clickableIcons";

export default function eventCard({
  eventName = "event name",
  profilePic = "https://www.dummyimage.com/40x40/000/fff",
  eventDesc,
  friends,
}) {
  return (
    <>
      <div className="border-2 rounded-md">
        <div className="m-2 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <ProfileIcon profilePic={profilePic} />
            <p>{eventName}</p>
          </div>
          <div>
            <ClickableIcons
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                </svg>
              }
            />
          </div>
        </div>
        <div className="m-2">{eventDesc}test</div>
        <div className="m-2 flex gap-2 items-center justify-between">
          <p>{friends}list of frinds</p>
          <div className="flex gap-1">
            <ClickableIcons icon={<p>Join</p>} />
            <ClickableIcons
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                </svg>
              }
            />
            <ClickableIcons
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
