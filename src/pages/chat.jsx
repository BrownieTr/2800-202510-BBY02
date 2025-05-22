import React, { useState, useEffect } from "react";
import ChatBubble from "../components/ui/chatBubble";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";

export default function chat() {
  // Authentication and state hooks
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0(); // Ensure 'user' is destructured
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const { conversationID } = useParams();
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState([]);
  const [recipientName, setRecipientName] = useState("");

  // Fetch messages when the user is authenticated
  useEffect(() => {
    let intervalId;
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchMessages();
      // Poll for new messages every 5 seconds
      intervalId = setInterval(() => {
        fetchMessages();
      }, 5000);
    }
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, conversationID]);

  const fetchCurrentUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:3000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error.message);
    }
  };

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
        throw new Error(`Can't find conversation! Status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);
      // If messages is empty, set recipientName from data
      if ((!data.messages || data.messages.length === 0) && data.recipientName) {
        setRecipientName(data.recipientName);
      } else if (data.messages && data.messages.length > 0) {
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
            senderName: user.name || "You", // Add sender's name
            profilePic:
              user.profilePic || "https://www.dummyimage.com/25x25/000/fff", // Add sender's profile picture
          },
        ]);

        setInputText("");
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <>
      {/* Navbar with a back button and recipient name */}
      <nav className="sticky top-0 z-50 border-b bg-white">
        <Navbar
          className="sticky top-0 z-50"
          iconLeft={<BackButton />}
          header={messages.length > 0 ? messages[0].recipientName : recipientName}
        />
      </nav>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto pb-5">
        {loading ? (
          <div className="text-center py-4">Loading messages...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : messages.length > 0 ? (
          messages.map((message, index) => (
            <ChatBubble
              key={message._id || index}
              isSent={message.sentByUser}
              message={message.message}
              timestamp={message.timestamp}
              username={message.senderName}
              profilePic={
                message.profilePic || "https://www.dummyimage.com/25x25/000/fff"
              }
            />
          ))
        ) : (
          <div className="text-center py-4">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>

      {/* Input field and send button */}
      <footer className="fixed bottom-1 left-1 right-1 flex items-center justify-between px-4 py-3 border rounded-2xl z-50 bg-white">
        <div className="flex-1 mx-2">
          <input
            type="text"
            placeholder="Message..."
            className="w-full focus:outline-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
        </div>
        <div className="text-right flex justify-center">
          <button onClick={() => sendMessage()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#000000"
            >
              <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
            </svg>
          </button>
        </div>
      </footer>
    </>
  );
}
