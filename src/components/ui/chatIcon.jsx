import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function ChatIcon() {
  const [hasUnread, setHasUnread] = useState(false);
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

  const checkUnreadMessages = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();
      const [conversationsResponse, userResponse] = await Promise.all([
        fetch("http://localhost:3000/api/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),
        fetch("http://localhost:3000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }),
      ]);

      if (!conversationsResponse.ok || !userResponse.ok) {
        throw new Error(
          `HTTP error! Conversations: ${conversationsResponse.status}, User: ${userResponse.status}`
        );
      }

      const [conversationsData, userData] = await Promise.all([
        conversationsResponse.json(),
        userResponse.json(),
      ]);

      const conversations = conversationsData.conversations || [];

      // Check if any conversation has unread messages not sent by current user
      const hasUnreadMessages = conversations.forEach((element) => {
        if (element.sender !== user._id && element.unread) {
          setHasUnread(true);
        }
      });
    } catch (error) {
      console.error("Error checking unread messages:", error);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Check for unread messages when component mounts and periodically
  useEffect(() => {
    if (isAuthenticated) {
      // Initial check
      checkUnreadMessages();

      // Set up polling to check for new messages every 10 seconds (reduced for better responsiveness)
      const intervalId = setInterval(checkUnreadMessages, 10000);

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, checkUnreadMessages]);

  // If there are unread messages, show the first icon
  if (hasUnread) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        viewBox="0 -960 960 960"
        width="20px"
        fill="#FFFFFF"
      >
        <path d="M80-80v-720q0-33 23.5-56.5T160-880h404q-4 20-4 40t4 40H160v525l46-45h594v-324q23-5 43-13.5t37-22.5v360q0 33-23.5 56.5T800-240H240L80-80Zm80-720v480-480Zm600 80q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" />
      </svg>
    );
  }

  // If there are no unread messages, show the second icon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 -960 960 960"
      width="20x"
      fill="#FFFFFF"
    >
      <path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
    </svg>
  );
}
