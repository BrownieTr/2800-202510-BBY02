import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";
import MessageCard from "../components/ui/messageCard";
import { useAuth0 } from "@auth0/auth0-react"; // Make sure this import is available
import { useNavigate } from "react-router-dom";

export default function NewChat() {
  // State hooks for managing search term, search results, and loading state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Add state for error message
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [preselectedPartner, setPreselectedPartner] = useState(null);

  // Check for preselected partner from match details
  useEffect(() => {
    const partnerId = localStorage.getItem("chatPartnerId");
    const partnerName = localStorage.getItem("chatPartnerName");
    
    console.log("Checking for preselected partner:", { partnerId, partnerName });
    
    if (partnerId) {
      setPreselectedPartner({
        _id: partnerId,
        name: partnerName || "Match Partner"
      });
      
      // Clear the localStorage data after retrieving it
      localStorage.removeItem("chatPartnerId");
      localStorage.removeItem("chatPartnerName");
      
      console.log("Starting conversation with partner ID:", partnerId);
      
      // Automatically start the conversation with this partner
      // Using setTimeout to ensure state has updated properly
      setTimeout(() => {
        startConversation(partnerId);
      }, 100);
    }
  }, []);

  // Search for users when the search term changes
  useEffect(() => {
    /**
     * Fetches users matching the search term from the API.
     */
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
   * Starts a new conversation with the selected user.
   *
   * @param {string} userId - The ID of the user to start a conversation with.
   */
  const startConversation = async (userId) => {
    if (!userId) {
      setErrorMessage("Cannot start conversation: Missing user ID");
      return;
    }

    console.log("Starting conversation with user ID:", userId);
    let retryCount = 0;
    const maxRetries = 2;

    const attemptStartConversation = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(""); // Clear any existing error messages
        const token = await getAccessTokenSilently();

        console.log("Creating conversation with recipient ID:", userId);

        // Use POST method and send userId in the request body
        const response = await fetch("/api/conversations/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipientId: userId }),
        });

        const responseText = await response.text();
        console.log("API response status:", response.status);
        console.log("API response text:", responseText);

        if (!response.ok) {
          let errorMsg = "Failed to start conversation";
          
          try {
            // Try to parse the error response
            const errorData = JSON.parse(responseText);
            if (errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (e) {
            // If parsing fails, use the response status text
            errorMsg = `Server error: ${response.statusText || response.status}`;
          }
          
          throw new Error(errorMsg);
        }

        // Parse the response text to get the conversation ID
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new Error("Invalid response from server");
        }

        if (!data.conversationId) {
          throw new Error("No conversation ID returned from server");
        }

        console.log("Conversation created successfully, navigating to:", data.conversationId);

        // Navigate to the chat page with the conversation ID
        navigate(`/chat/${data.conversationId}`);
      } catch (error) {
        console.error("Error starting conversation:", error);
        
        // Check if it's a network error and we can retry
        if (retryCount < maxRetries && error.message.includes("network")) {
          retryCount++;
          setErrorMessage(`Connection issue. Retrying... (${retryCount}/${maxRetries})`);
          setTimeout(attemptStartConversation, 1000); // Retry after 1 second
          return;
        }
        
        // Set appropriate error message based on the error
        if (error.message.includes("user not found") || error.message.includes("recipient")) {
          setErrorMessage("User not found or unavailable. Please select another user.");
        } else if (error.message.includes("already exists")) {
          setErrorMessage("You already have a conversation with this user.");
          
          // Try to extract conversation ID from error message to navigate there
          const match = error.message.match(/conversation_id:(\w+)/);
          if (match && match[1]) {
            setTimeout(() => {
              navigate(`/chat/${match[1]}`);
            }, 1500);
          }
        } else if (error.message.includes("Missing") || error.message.includes("partner")) {
          setErrorMessage("Cannot start chat: Missing partner information. Please find a new match or search for a user.");
        } else {
          setErrorMessage(`Failed to start conversation: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    await attemptStartConversation();
  };

  return (
    <>
      {/* Navbar with a back button */}
      <Navbar header="PlayPal" iconLeft={<BackButton />} />
      <div className="min-h-screen flex flex-col">
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-2 mx-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
            {errorMessage.includes("Missing") && (
              <div className="mt-2">
                <button
                  onClick={() => navigate('/match-preferences')}
                  className="text-blue-700 underline mr-4"
                >
                  Find new match
                </button>
                <button
                  onClick={() => {
                    setErrorMessage("");
                    setSearchTerm("");
                  }}
                  className="text-blue-700 underline"
                >
                  Search for user
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search results or loading indicator */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="text-center p-4">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {searchResults.map((user) => (
                <div key={user._id} onClick={() => startConversation(user._id)}>
                  <MessageCard username={user.name} profilePic={user.profilePic} />
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
