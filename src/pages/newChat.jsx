import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";
import MessageCard from "../components/ui/messageCard";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import GlassNavbar from "../components/layout/glassNavbar";

export default function NewChat() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [setPreselectedPartner] = useState(null);

  // Check for preselected partner from match details
  useEffect(() => {
    const partnerId = localStorage.getItem("chatPartnerId");
    const partnerName = localStorage.getItem("chatPartnerName");

    console.log("Checking for preselected partner:", {
      partnerId,
      partnerName,
    });

    if (partnerId) {
      setPreselectedPartner({
        _id: partnerId,
        name: partnerName || "Match Partner",
      });

      // Clear the localStorage data after retrieving it
      localStorage.removeItem("chatPartnerId");
      localStorage.removeItem("chatPartnerName");

      console.log("Starting conversation with partner ID:", partnerId);

      // Automatically start the conversation with this partner
      setTimeout(() => {
        startConversation(partnerId);
      }, 100);
    }
  }, []);

  // Search for users when the search term changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const token = await getAccessTokenSilently();

        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchTerm)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setSearchResults(data.users);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, getAccessTokenSilently]);

  /**
   * FIXED: Starts a new conversation with the selected user.
   */
  const startConversation = async (userId) => {
    if (!userId) {
      setErrorMessage("Cannot start conversation: Missing user ID");
      return;
    }

    console.log("Starting conversation with user ID:", userId);

    try {
      setIsLoading(true);
      setErrorMessage("");

      const token = await getAccessTokenSilently();

      console.log("Creating conversation with recipient ID:", userId);

      // FIXED: Proper error handling and request structure
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 400) {
          throw new Error(errorData.error || "Invalid user ID format");
        } else if (response.status === 404) {
          throw new Error(errorData.error || "User not found");
        } else {
          throw new Error(
            errorData.error || `Server error: ${response.status}`
          );
        }
      }

      const data = await response.json();

      if (!data.conversationId) {
        throw new Error("No conversation ID returned from server");
      }

      console.log(
        "Conversation created/found successfully:",
        data.conversationId
      );

      // FIXED: Use navigate with proper error handling
      navigate(`/chat/${data.conversationId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);

      // FIXED: Better error messages for different scenarios
      if (
        error.message.includes("Invalid") ||
        error.message.includes("format")
      ) {
        setErrorMessage(
          "Invalid user selection. Please try selecting a different user."
        );
      } else if (error.message.includes("not found")) {
        setErrorMessage("User not found. They may have deleted their account.");
      } else if (error.message.includes("already")) {
        setErrorMessage(
          "You already have a conversation with this user. Redirecting..."
        );
        // If conversation exists, try to extract and navigate to it
        setTimeout(() => {
          navigate("/messages");
        }, 2000);
      } else {
        setErrorMessage(`Failed to start conversation: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const backIcon = (
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

  return (
    <>
      {/* Background decoration */}
      <div
        className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
      bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"
      ></div>
      <div
        className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px]
      bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"
      ></div>

      {/* Navbar with a back button */}
      <GlassNavbar
        title="PlayPal"
        leftIcon={backIcon}
        onLeftIconClick={() => navigate(-1)}
      />
      <div className="app-container min-h-screen flex flex-col">
        {/* Search input field */}
        <div className="p-4 border-b border-gray-700 text-left">
          <span className="mr-2">To:</span>
          <input
            type="text"
            placeholder="username"
            className="bg-transparent focus:outline-none w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-2 mx-4"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>×
            </button>
          </div>
        )}

        {/* Search results or loading indicator */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {searchResults.map((user) => (
                <div key={user._id} onClick={() => startConversation(user._id)}>
                  <MessageCard
                    username={user.name}
                    profilePic={user.profilePic}
                  />
                </div>
              ))}
            </ul>
          ) : searchTerm.trim() !== "" ? (
            <div className="text-center p-4 text-gray-400">No users found</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
