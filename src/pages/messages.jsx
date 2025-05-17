import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/navbar";
import MessageCard from "../components/ui/messageCard";
import BackButton from "../components/ui/backButton";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

export default function Messages() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      // Get the access token from Auth0
      const token = await getAccessTokenSilently();
      
      // Fetch conversations from your backend API
      const response = await fetch('http://localhost:3000/api/conversations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setConversations(data.conversations || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-4">Please log in to view your messages.</div>;
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white">
        <Navbar
          iconLeft={<BackButton />}
          iconRight2={
            <Link to="/chat/new">
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
            </Link>
          }
          header="Messages"
        />
      </nav>
      <div className="flex flex-col items-center mt-5 gap-1 pb-20">
        {conversations.length > 0 ? (
          conversations.map((convo) => (
            <Link 
              to={`/chat/${convo.recipientId}`} 
              key={convo._id}
              className="w-full"
            >
              <MessageCard 
                profilePic={"https://www.dummyimage.com/50x50/000/fff"}
                name={convo.recipientName} 
                lastMessage={convo.lastMessage || "No messages yet"}
                timestamp={new Date(convo.timestamp).toLocaleString()}
              />
            </Link>
          ))
        ) : (
          <div className="text-gray-500 p-4">No conversations yet</div>
        )}
      </div>
    </>
  );
}