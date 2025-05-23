import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassBettingCard from "../components/ui/glassBettingCard";
import ChatIcon from "../components/ui/chatIcon";

export default function SportsBetting() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [username, setUsername] = useState("Player");
  const [balance, setBalance] = useState("1000");
  
  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
    }
  }, [user]);

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
  
  const sampleMatches = [
    {
      setting: "Today, 8:00 PM • Local Arena",
      team1: "Lakers",
      team2: "Warriors",
      odds1: "1.85",
      odds2: "2.50",
      odds3: "1.95"
    },
    {
      setting: "Tomorrow, 7:30 PM • Sports Center",
      team1: "Raptors",
      team2: "Celtics",
      odds1: "2.10",
      odds2: "3.00",
      odds3: "1.75"
    },
    {
      setting: "Saturday, 6:00 PM • Downtown Stadium",
      team1: "Heat",
      team2: "Bulls",
      odds1: "1.90",
      odds2: "2.70",
      odds3: "2.05"
    },
    {
      setting: "Sunday, 4:15 PM • Memorial Center",
      team1: "Bucks",
      team2: "Nets",
      odds1: "1.65",
      odds2: "2.30",
      odds3: "2.20"
    }
  ];

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
        title="Sports Betting"
        leftIcon={backIcon}
        rightIcon={profileIcon}
        rightIcon2={<ChatIcon/>}
        onLeftIconClick={() => navigate("/home")}
        onRightIconClick={() => navigate("/profile")}
        onRightIcon2Click={() => navigate("/messages")}
      />
      
      <div className="app-container">
        <main className="main-content">
          {/* User Balance Card */}
          <div className="glass-card">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{username}</h2>
                <p className="text-sm opacity-80">Welcome back</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm opacity-80">Balance</p>
                <p className="text-xl font-bold">${balance}</p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button className="glass-icon-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Betting Cards */}
          {sampleMatches.map((match, index) => (
            <GlassBettingCard
              key={index}
              setting={match.setting}
              team1={match.team1}
              team2={match.team2}
              odds1={match.odds1}
              odds2={match.odds2}
              odds3={match.odds3}
            />
          ))}
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}
