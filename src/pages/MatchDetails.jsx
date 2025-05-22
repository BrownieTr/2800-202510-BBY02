import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassButton from "../components/ui/glassButton";
import { getMatchDetails } from "../services/matchMaking";

export default function MatchDetails() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  // Load match data from localStorage and then fetch complete details from server
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setIsLoading(true);
        const storedMatchData = localStorage.getItem("matchData");
        
        if (!storedMatchData) {
          setError("No match data found");
          setIsLoading(false);
          return;
        }
        
        const parsedData = JSON.parse(storedMatchData);
        console.log("Initial match data:", parsedData);
        
        // Determine if we have a matchID or _id to use for fetching details
        const matchIdentifier = parsedData.matchID || parsedData.matchId || parsedData._id;
        
        if (matchIdentifier) {
          try {
            // Fetch complete match details from server
            const fullMatchData = await getMatchDetails(matchIdentifier, getAccessTokenSilently);
            console.log("Fetched match details:", fullMatchData);
            
            // Update with complete data from server
            setMatchData(fullMatchData);
          } catch (fetchError) {
            console.error("Error fetching match details:", fetchError);
            // Continue with the data from localStorage
            setMatchData(parsedData);
          }
        } else {
          // No ID to fetch with, just use the localStorage data
          setMatchData(parsedData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error handling match data:", error);
        setError("Error loading match details");
        setIsLoading(false);
        // Don't navigate away, show error instead
      }
    };

    if (isAuthenticated) {
      fetchMatchData();
    }
  }, [navigate, isAuthenticated, getAccessTokenSilently]);

  // Get current user's ID from Auth0
  const { user } = useAuth0();
  
  // Determine if current user is player1 or player2
  const isPlayer1 = user && matchData && matchData.player1 && user.sub === matchData.player1;
  
  // Get partner's ID and name based on whether current user is player1 or player2
  const getPartnerInfo = () => {
    if (!matchData) return { id: null, name: "Unknown Partner" };
    
    // Check if we're using Auth0 user sub or different ID format
    const currentUserId = user?.sub;
    
    // Debug log to help troubleshoot
    console.log("DETAILED DEBUG - Match data:", JSON.stringify(matchData, null, 2));
    console.log("DETAILED DEBUG - Current user:", JSON.stringify(user, null, 2));
    
    // Create an array of all possible partner IDs from the match data
    const possiblePartnerIds = [
      // Player IDs
      matchData.player2,
      matchData.player1,
      // Other possible ID formats
      matchData.player2Id,
      matchData.player1Id,
      matchData.participant2,
      matchData.participant1,
      matchData.partnerId,
      matchData.userId,
      // ID from match ID if it contains user IDs
      matchData.matchID?.split('_')[1],
      matchData.matchID?.split('_')[2]
    ].filter(id => id && id !== currentUserId); // Filter out null/undefined and current user
    
    console.log("DETAILED DEBUG - Possible partner IDs:", possiblePartnerIds);
    
    // Get possible partner names
    const possiblePartnerNames = [
      matchData.player2Name,
      matchData.player1Name,
      matchData.participant2Name,
      matchData.participant1Name,
      matchData.partnerName,
      "Match Partner"
    ].filter(Boolean); // Filter out null/undefined
    
    // Check if user is player1 by comparing IDs
    if (matchData.player1 && currentUserId === matchData.player1) {
      return {
        id: matchData.player2 || possiblePartnerIds[0] || null,
        name: matchData.player2Name || possiblePartnerNames[0] || "Match Partner"
      };
    }
    // Check if user is player2
    else if (matchData.player2 && currentUserId === matchData.player2) {
      return {
        id: matchData.player1 || possiblePartnerIds[0] || null,
        name: matchData.player1Name || possiblePartnerNames[0] || "Match Partner"
      };
    }
    // If we can't determine which player the current user is, use any available partner info
    else {
      // Return first available partner ID and name
      return {
        id: possiblePartnerIds[0] || null,
        name: possiblePartnerNames[0] || "Match Partner"
      };
    }
  };
  
  const partnerInfo = getPartnerInfo();
  
  // Function to directly initiate a chat with the match partner
  const handleStartChat = async () => {
    if (!matchData) {
      setError("Cannot start chat: Missing match information");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get partner information
      const partnerData = getPartnerInfo();
      console.log("Partner data for chat:", partnerData);
      
      if (!partnerData.id) {
        throw new Error("Cannot find partner ID. Please try finding a new match.");
      }
      
      // Create conversation via API
      const token = await getAccessTokenSilently();
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: partnerData.id
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          // If conversation exists, use that ID
          if (errorData.conversationId) {
            navigate(`/chat/${errorData.conversationId}`);
            return;
          }
        } catch (e) {
          // Continue to throw the error
        }
        
        throw new Error(`Failed to create conversation: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Conversation created:", data);
      
      if (!data.conversationId) {
        throw new Error("No conversation ID returned");
      }
      
      // Store some context for the chat page
      localStorage.setItem("currentChatInfo", JSON.stringify({
        conversationId: data.conversationId,
        partnerName: partnerData.name,
        matchData: matchData
      }));
      
      // Navigate to the chat page with the conversation ID
      navigate(`/chat/${data.conversationId}`);
      
    } catch (error) {
      console.error("Error starting chat:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindNew = () => {
    // Clear the current match data
    localStorage.removeItem("matchData");
    // Go back to match preferences
    navigate("/match-preferences");
  };

  // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="text-white text-center p-10">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-xl">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="glass-card max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-white mb-6">{error}</p>
          <GlassButton
            onClick={() => navigate("/home")}
            className="w-full bg-blue-500 bg-opacity-30 py-3"
          >
            Return Home
          </GlassButton>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="glass-card max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">No Match Found</h2>
          <p className="text-white mb-6">We couldn't find your match data. Please try finding a match again.</p>
          <GlassButton
            onClick={() => navigate("/match-preferences")}
            className="w-full bg-blue-500 bg-opacity-30 py-3"
          >
            Find New Match
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Background decoration */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
      <GlassNavbar
        title="Match Details"
        leftIcon={backIcon}
        onLeftIconClick={() => navigate("/home")}
      />
      
      <div className="app-container">
        <main className="main-content">
          
          {/* Player information */}
          <div className="glass-card mb-6">
            <h2 className="text-xl font-bold mb-4">Match Partner</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {partnerInfo.name}
                </h3>
                <p className="text-white opacity-80">
                  {matchData?.skillLevel || "Skill level not specified"}
                </p>
              </div>
            </div>
          </div>
            
          {/* Match information */}
          <div className="glass-card mb-6">
            <h2 className="text-xl font-bold mb-4">Match Information</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-2">
              <div>
                <p className="font-semibold text-white opacity-80">Sport</p>
                <p className="text-white">{matchData?.sport || "Not specified"}</p>
              </div>
              <div>
                <p className="font-semibold text-white opacity-80">Distance</p>
                <p className="text-white">{matchData?.distance || 0} km</p>
              </div>
              <div>
                <p className="font-semibold text-white opacity-80">Mode</p>
                <p className="text-white">{matchData?.mode || "Not specified"}</p>
              </div>
              <div>
                <p className="font-semibold text-white opacity-80">Match Type</p>
                <p className="text-white">{matchData?.matchType || "Not specified"}</p>
              </div>
            </div>
            
            {matchData?.timestamp && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className="font-semibold text-white">Match Schedule</p>
                <p className="text-white">{matchData.timestamp}</p>
              </div>
            )}
            
            {matchData?.status && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className="font-semibold text-white">Status</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    matchData.status === 'active' ? 'bg-green-500' :
                    matchData.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></span>
                  <p className="text-white capitalize">{matchData.status}</p>
                </div>
              </div>
            )}
            
            {matchData?.matchID && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className="font-semibold text-white text-sm">Match ID</p>
                <p className="text-white text-xs opacity-70 break-all">{matchData.matchID}</p>
              </div>
            )}
          </div>
          
          
          {/* Action buttons */}
          <div className="space-y-4">
            <GlassButton
              className="w-full bg-green-500 bg-opacity-30 py-4"
              onClick={handleStartChat}
            >
              Start Chat with {partnerInfo.name.split(' ')[0] || "Partner"}
            </GlassButton>
            
            <GlassButton
              className="w-full bg-blue-500 bg-opacity-30 py-4"
              onClick={handleFindNew}
            >
              Find Another Match
            </GlassButton>
          </div>
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}