import React, { useState, useEffect, use } from "react";
import ClickableIcons from "../components/ui/clickableIcons";
import ChatBubble from "../components/ui/chatBubble";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";

export default function chat() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const { conversationID } = useParams();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/api/chat/${conversationID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white">
        <Navbar
          className="sticky top-0 z-50"
          iconLeft={<BackButton />}
          header="username"
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
        {loading ? (
          <div className="text-center py-4">Loading messages...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : messages.length > 0 ? (
          messages.map((message, index) => (
            <ChatBubble
              key={message._id || index}
              isSent={message.senderID === user?.sub}
              message={message.message}
              timestamp={message.timestamp}
            />
          ))
        ) : (
          <div className="text-center py-4">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>
      <footer className="fixed bottom-1 left-1 right-1 flex items-center justify-between px-4 py-3 border rounded-2xl z-50 bg-white">
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
