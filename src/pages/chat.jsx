import React from "react";
import ClickableIcons from "../components/ui/clickableIcons";
import ProfileIcon from "../components/ui/profileIcon";
import ChatBubble from "../components/ui/chatBubble";

export default function chat({ recipient = "recipient" }) {
  return (
    <>
      <div>
        <nav className="flex items-center justify-between px-4 py-3 ">
          <div className="w-10">
            <ClickableIcons
              icon={
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
            />
          </div>
          <ProfileIcon
            profilePic={"https://www.dummyimage.com/30x30/000/fff"}
          />
          <div className="flex-1 text-left pl-4">
            <h4>{recipient}</h4>
          </div>
          <div className="w-10 text-right">
            <ClickableIcons
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              }
            />
          </div>
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto pb-16">
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
      </div>
      <div className="flex items-center justify-between px-4 py-3 border">
        <div className="text-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
          </svg>
        </div>
        <div className="text-right">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
          </svg>
        </div>
      </div>
    </>
  );
}
