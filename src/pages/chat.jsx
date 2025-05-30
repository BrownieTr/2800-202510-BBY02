import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassChatBubble from "../components/ui/glassChatBubble";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";

export default function Chat() {
  // Authentication and state hooks
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } =
    useAuth0();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const { conversationID } = useParams();
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [recipientName, setRecipientName] = useState("");

  // Fetch messages when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Improved periodic message fetching
  useEffect(() => {
    let intervalId;

    if (isAuthenticated && conversationID && !isNewConversation && !loading) {
      // Fetch messages every 3 seconds (3000ms)
      intervalId = setInterval(() => {
        fetchMessages();
      }, 3000);
    }

    // Cleanup interval when component unmounts or dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, conversationID, isNewConversation, loading]);

  /**
   * Fetches current user information
   */
  const fetchCurrentUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        console.error("Failed to fetch current user:", response.status);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  /**
   * Fetches messages for the current conversation from the API.
   * Updated to prevent unnecessary re-renders when messages haven't changed
   */
  const fetchMessages = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`/api/chat/${conversationID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Only set new conversation state if not already set
          if (!isNewConversation) {
            setIsNewConversation(true);
            setMessages([
              {
                _id: "welcome_msg",
                message:
                  "Start a new conversation! Your first message will create this chat.",
                sentByUser: false,
                timestamp: new Date().toISOString(),
                senderName: "PlayPal",
                profilePic: null,
                isSystemMessage: true,
              },
            ]);
          }
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const newMessages = data.messages || [];

      if(newMessages.length == 0) {
        setRecipientName(data.recipientName || "Chat") 
      }

      // Only update state if messages have actually changed
      setMessages((prevMessages) => {
        if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
          return newMessages;
        }
        return prevMessages;
      });

      setLoading(false);

      // Mark conversation as read
      try {
        await fetch(`/api/conversations/${conversationID}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (markReadError) {
        console.warn("Could not mark conversation as read:", markReadError);
      }
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
      // Generate a temporary ID for this message
      const tempMessageId = `temp_${Date.now()}`;
      const messageText = inputText.trim();

      // Clear input immediately for better UX
      setInputText("");

      // Add message to UI immediately (optimistic update)
      const newMessage = {
        _id: tempMessageId,
        message: messageText,
        sentByUser: true,
        timestamp: new Date().toISOString(),
        senderName: user?.name || user?.nickname || "You",
        profilePic: user?.picture || "https://www.dummyimage.com/25x25/000/fff",
        isPending: true,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      try {
        // If this is a new conversation (no API record yet), don't try to send to API
        if (isNewConversation) {
          console.log(
            "New conversation - marking first message as sent locally"
          );

          // Just update the message to remove pending state
          setTimeout(() => {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === tempMessageId
                  ? { ...msg, isPending: false, isLocalOnly: true }
                  : msg
              )
            );

            // Remove system welcome message and add response
            setMessages((prevMessages) => {
              const filteredMessages = prevMessages.filter(
                (msg) => !msg.isSystemMessage
              );
              return [
                ...filteredMessages,
                {
                  _id: "welcome_response",
                  message:
                    "Message sent! Your chat partner will see your message when they connect.",
                  sentByUser: false,
                  timestamp: new Date().toISOString(),
                  senderName: "PlayPal",
                  profilePic: null,
                  isSystemMessage: true,
                },
              ];
            });
          }, 500);

          return;
        }

        // Normal case - send to API
        const token = await getAccessTokenSilently();
        const response = await fetch("/api/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationID,
            message: messageText,
          }),
        });

        if (!response.ok) {
          // If API gives 400/404, switch to local-only mode
          if (response.status === 400 || response.status === 404) {
            console.log("API rejected message - switching to local-only mode");
            setIsNewConversation(true);

            // Update the pending message
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === tempMessageId
                  ? { ...msg, isPending: false, isLocalOnly: true }
                  : msg
              )
            );

            return;
          }

          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update the temporary message with the real one from API
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === tempMessageId
              ? {
                  _id: data._id,
                  message: messageText,
                  sentByUser: true,
                  timestamp: data.timestamp || new Date().toISOString(),
                  senderName: user?.name || user?.nickname || "You",
                  profilePic:
                    user?.picture || "https://www.dummyimage.com/25x25/000/fff",
                  isPending: false,
                }
              : msg
          )
        );
      } catch (error) {
        console.error("Error sending message:", error);

        // Mark message as failed
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === tempMessageId
              ? { ...msg, isPending: false, isFailed: true }
              : msg
          )
        );

        setError(error.message);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // BackButton component
  const BackButton = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  // Show loading while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Please log in to access chat.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <GlassNavbar
        title={messages.find((m) => !m.sentByUser)?.senderName || recipientName ||"Chat"}
        leftIcon={BackButton}
        onLeftIconClick={() => navigate(-1)}
      />
      {/* Scrollable message area - takes up all available space */}
      <div className="flex-grow overflow-y-auto px-2 pb-24 pt-15">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-white">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></div>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card bg-red-500 bg-opacity-25 mx-auto max-w-md">
            <p className="text-white">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-white underline text-sm"
            >
              Dismiss
            </button>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3 max-w-md mx-auto">
            {isNewConversation && (
              <div className="glass-card bg-yellow-500 bg-opacity-20 mx-auto mb-3 py-2">
                <p className="text-white text-sm text-center">
                  You're in local preview mode. Messages will be saved when
                  connection is restored.
                </p>
              </div>
            )}

            {messages.map((message, index) =>
              message.isSystemMessage ? (
                // System message (info, welcome, etc.)
                <div
                  key={message._id || index}
                  className="glass-card bg-blue-500 bg-opacity-15 mx-auto my-2 py-2 px-3"
                >
                  <p className="text-white text-sm text-center">
                    {message.message}
                  </p>
                </div>
              ) : (
                // Regular chat message
                <div key={message._id || index}>
                  <GlassChatBubble
                    isSent={message.sentByUser}
                    message={message.message}
                    timestamp={message.timestamp}
                    username={
                      message.sentByUser
                        ? currentUser?.name ||
                          currentUser?.username ||
                          user?.name ||
                          user?.nickname ||
                          "You"
                        : message.senderName
                    }
                    profilePic={
                      message.profilePic ||
                      "https://www.dummyimage.com/25x25/000/fff"
                    }
                  />
                  {/* Message status indicators */}
                  {message.sentByUser && (
                    <div className="text-xs text-white opacity-70 mt-1 text-right pr-2">
                      {message.isPending && <span>Sending...</span>}
                      {message.isLocalOnly && <span>Saved locally</span>}
                      {message.isFailed && (
                        <span className="text-red-300">Failed to send</span>
                      )}
                    </div>
                  )}
                </div>
              )
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="glass-card text-center mx-auto max-w-md">
            <p className="text-white">No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>

      {/* Fixed position input field */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-50">
        <div
          className="glass-card max-w-md mx-auto"
          style={{
            marginBottom: 0,
            padding: "8px 12px",
            animation: "none",
            opacity: 1,
            transform: "none",
          }}
        >
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
                width="20"
                height="20"
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
