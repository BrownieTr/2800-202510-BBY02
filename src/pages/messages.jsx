import React from "react";
import Navbar from "../components/layout/navbar";
import MessageCard from "../components/ui/messageCard";

export default function messages() {
  return (
    <>
      <Navbar
        iconLeft={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </svg>
        }
        iconLeftTo={"/home"}
        iconRight2={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
            className="ml-auto"
          >
            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
          </svg>
        }
        header="username"
      />
      <div className="flex flex-col items-center h-screen mt-5 gap-1">
        <MessageCard profilePic={"https://www.dummyimage.com/50x50/000/fff"} />
        <MessageCard profilePic={"https://www.dummyimage.com/50x50/000/fff"} />
      </div>
    </>
  );
}