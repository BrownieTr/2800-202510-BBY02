import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassChatBubble from "../components/ui/glassChatBubble";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";

export default function Chat() {
  // Authentication and state hooks
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const { conversationID } = useParams();
  const [inputText, setInputText] = useState("");
  const [recipientName, setRecipientName] = useState("Chat");

  // Fetch messages when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  /**
   * Fetches messages for the current conversation from the API.
   */
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
      
      // Set recipient name if available
      if (data.messages && data.messages[0] && data.messages[0].recipientName) {
        setRecipientName(data.messages[0].recipientName);
      }
      
      setLoading(false);

      // Mark conversation as read when opened
      await fetch(
        `http://localhost:3000/api/conversations/${conversationID}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  /**
   * Sends a new message to the API and updates the local message list.
   */
  const sendMessage = async () => {
    if (inputText.trim() !== "") {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch("http://localhost:3000/api/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationID,
            message: inputText,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            _id: data._id,
            message: inputText,
            sentByUser: true,
            timestamp: new Date().toISOString(),
            senderName: user?.name || user?.nickname || "You",
            profilePic: user?.picture || "https://www.dummyimage.com/25x25/000/fff",
          },
        ]);

        setInputText("");
      } catch (error) {
        console.error("Error sending message:", error);
        setError(error.message);
      }
    }
  };

  // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  return (
    <div className="min-h-screen max-h-screen flex flex-col">
      {/* Background decoration */}
      <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
      bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px]
      bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      
      {/* Fixed height navbar */}
      <div className="flex-none">
        <GlassNavbar
          title={recipientName}
          leftIcon={backIcon}
          onLeftIconClick={() => navigate("/messages")}
        />
      </div>
      
      {/* Scrollable message area - takes up all available space */}
      <div className="flex-grow overflow-y-auto px-2 pt-14 pb-24 pt-2">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-white">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></div>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card bg-red-500 bg-opacity-25 mx-auto max-w-md">
            <p className="text-white">Error: {error}</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3 max-w-md mx-auto">
            {messages.map((message, index) => (
              <GlassChatBubble
                key={message._id || index}
                isSent={message.sentByUser}
                message={message.message}
                timestamp={message.timestamp}
                username={message.senderName}
                profilePic={
                  message.profilePic || "https://www.dummyimage.com/25x25/000/fff"
                }
              />
            ))}
          </div>
        ) : (
          <div className="glass-card text-center mx-auto max-w-md">
            <p className="text-white">No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>
      
      {/* Fixed position input field */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-50">
        <div className="glass-card max-w-md mx-auto" style={{marginBottom: 0, padding: "8px 12px", animation: "none", opacity: 1, transform: "none"}}>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none text-white placeholder-white placeholder-opacity-60 focus:outline-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              className="glass-icon-button ml-2"
              disabled={inputText.trim() === ""}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Fixed height tab bar */}
      <div className="flex-none">
        <GlassTabBar />
      </div>
    </div>
  );
}
