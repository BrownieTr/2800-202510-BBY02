import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/navbar";
import MessageCard from "../components/ui/messageCard";
import BackButton from "../components/ui/backButton";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

export default function Messages() {
  // Destructure Auth0 hooks for authentication and user data
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();

  // State variables to manage conversations, loading state, and errors
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch conversations when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

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

  // Show a loading screen if data is still being fetched
  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Display an error message if there was an issue fetching data
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Prompt the user to log in if they are not authenticated
  if (!isAuthenticated) {
    return <div className="p-4">Please log in to view your messages.</div>;
  }

  // Log the fetched conversations to the console for debugging
  console.log("Conversations:", conversations);

  // Render the messages page
  return (
    <>
      {/* Navbar with navigation buttons */}
      <nav className="sticky top-0 z-50 bg-white">
        <Navbar
          iconLeft={<BackButton />}
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
          iconRight2To={"/new-chat"}
          header="Messages"
        />
      </nav>

      {/* Main content area */}
      <div className="flex flex-col items-center mt-5 gap-1 pb-20">
        {/* Display conversations if available */}
        {conversations.length > 0 ? (
          conversations.map((convo) => (
            <Link to={`/chat/${convo._id}`} key={convo._id} className="w-full">
              <MessageCard
                profilePic={convo.profilePic || "https://www.dummyimage.com/40x40/000/fff"}
                username={convo.recipientName || "Unknown User"}
                lastMessage={convo.lastMessage || "No messages yet"}
                time={new Date(convo.timestamp).toLocaleString()}
              />
            </Link>
          ))
        ) : (
          // Show a message if no conversations are available
          <div className="text-gray-500 p-4">No conversations yet</div>
        )}
      </div>
    </>
  );
}
