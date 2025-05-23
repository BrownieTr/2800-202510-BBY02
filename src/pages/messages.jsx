import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassMessageCard from "../components/ui/glassMessageCard";
import GlassButton from "../components/ui/glassButton";

export default function Messages() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // State variables to manage conversations, loading state, and errors
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // Fetch conversations when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Function to fetch user data
  const fetchUserData = async () => {
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
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
    }
  };

  // Function to fetch conversations from the backend API
  const fetchConversations = async () => {
    try {
      // Get the access token from Auth0
      const token = await getAccessTokenSilently();

      // Make a request to the backend API with the token
      const response = await fetch("http://localhost:3000/api/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response and update the state
      const data = await response.json();
      setConversations(data.conversations || []);
      setLoading(false);
    } catch (error) {
      // Handle errors during the fetch process
      console.error("Error fetching conversations:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
  
  // Profile icon
  const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
  
  // Add icon
  const addIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  // Show a loading screen if data is still being fetched
  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 relative mb-4">
            <div className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
          <p className="text-white text-xl font-semibold">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Render the messages page
  return (
    <div>
      {/* Background decoration */}
      <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
      bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px] 
      bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      
      <GlassNavbar
        title="Messages"
        leftIcon={backIcon}
        rightIcon={profileIcon}
        rightIcon2={addIcon}
        onLeftIconClick={() => navigate(-1)}
        onRightIconClick={() => navigate("/profile")}
        onRightIcon2Click={() => navigate("/new-chat")}
      />
      
      <div className="app-container">
        <main className="main-content">
          {error && (
            <div className="glass-card bg-red-500 bg-opacity-25 mb-4">
              <p className="text-white">{error}</p>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="glass-card text-center">
              <p className="text-white">Please log in to view your messages</p>
            </div>
          )}
          
          {/* Message list */}
          {conversations.length > 0 ? (
            <div>
              {conversations.map((convo) => {
                // Only show as unread if the current user is not the sender
                const isUserSender =
                  userData &&
                  convo.sender &&
                  convo.sender.toString() === userData._id.toString();
                const shouldShowUnread = convo.unread && !isUserSender;

                return (
                  <Link to={`/chat/${convo._id}`} key={convo._id} className="block">
                    <GlassMessageCard
                      profilePic={
                        convo.profilePic ||
                        "https://www.dummyimage.com/40x40/000/fff"
                      }
                      username={convo.recipientName || "Unknown User"}
                      lastMessage={convo.lastMessage || "No messages yet"}
                      time={new Date(convo.timestamp).toLocaleString()}
                      unread={shouldShowUnread}
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card text-center">
              <h2 className="text-xl font-bold mb-2">No conversations yet</h2>
              <p className="mb-4 text-white text-opacity-80">
                Start a new conversation by clicking the + button
              </p>
              <GlassButton onClick={() => navigate("/new-chat")}>
                New Conversation
              </GlassButton>
            </div>
          )}
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}
