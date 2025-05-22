import React from "react";

export default function GlassBettingCard({
  setting = "dateAndTimeAndLocation",
  team1 = "team1",
  team2 = "team2",
  odds1 = "odds1",
  odds2 = "odds2",
  odds3 = "odds3",
}) {
  return (
    <div className="glass-card match-card">
      <div className="event-header">
        <h2>Upcoming Match</h2>
        <span>{setting}</span>
      </div>
      
      <div className="teams-container">
        <div className="team">
          <div className="team-logo">{team1.charAt(0)}</div>
          <div className="team-name">{team1}</div>
        </div>
        
        <div className="versus">VS</div>
        
        <div className="team">
          <div className="team-logo">{team2.charAt(0)}</div>
          <div className="team-name">{team2}</div>
        </div>
      </div>
      
      <div className="odds-container">
        <div className="odd-item">
          <div className="mb-1">{team1}</div>
          <div>{odds1}</div>
        </div>
        <div className="odd-item">
          <div className="mb-1">Draw</div>
          <div>{odds2}</div>
        </div>
        <div className="odd-item">
          <div className="mb-1">{team2}</div>
          <div>{odds3}</div>
        </div>
      </div>
    </div>
  );
}