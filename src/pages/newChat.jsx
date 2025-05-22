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
    try {
      setIsLoading(true);
      setErrorMessage(""); // Clear any existing error messages
      const token = await getAccessTokenSilently();

      // Use POST method and send userId in the request body
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();

      // Navigate to the chat page with the conversation ID
      navigate(`/chat/${data.conversationId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setErrorMessage("Failed to start conversation. Please try again."); // Display error message
    } finally {
      setIsLoading(false);
    }
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
