import React from "react";
import ClickableIcons from "../components/ui/clickableIcons";
import ProfileIcon from "../components/ui/profileIcon";
import ChatBubble from "../components/ui/chatBubble";
import Navbar from "../components/layout/navbar";

export default function chat({ recipient = "recipient" }) {
  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white">
        <Navbar
          className="sticky top-0 z-50"
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
          iconLeftTo={"/messages"}
          header={recipient}
          iconRight2={
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
      </nav>
      <div className="flex-1 overflow-y-auto pb-5">
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
        <ChatBubble isSent={false} />
        <ChatBubble isSent={true} />
      </div>
      <footer className="flex items-center rounded-2xl justify-between px-1 py-3 border sticky bottom-5 z-50 bg-white">
        <div className="text-left">
          <ClickableIcons
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
              </svg>
            }
          />
        </div>
        <div className="flex-1 mx-2">
          <input 
            type="text" 
            placeholder="Message..." 
            className="w-full focus:outline-none" 
          />
        </div>
        <div className="text-right">
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
        </div>
      </footer>
    </>
  );
}
