import React from "react";
import GlassButton from "./glassButton";

export default function GlassEventCard({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  participants,
  onJoin,
  onViewDetails,
  isUserParticipating = false, // NEW: Flag to determine if user has joined
  eventId // NEW: Event ID for actions
}) {
  return (
    <div className="glass-card event-card">
      <div className="event-header">
        <h2>{title}</h2>
        <span>{date}</span>
      </div>
      
      <p>{description}</p>
      
      <div className="event-details">
        <div className="event-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{time || "Time TBD"}</span>
        </div>
        
        <div className="event-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{location}</span>
        </div>
        
        <div className="event-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{participants}</span>
        </div>
      </div>
      
      <div className="event-actions">
        {/* UPDATED: Conditional button rendering based on participation status */}
        {isUserParticipating ? (
          <GlassButton 
            className="bg-blue-500 bg-opacity-30"
            onClick={() => onViewDetails && onViewDetails(eventId)}
          >
            View Details
          </GlassButton>
        ) : (
          <GlassButton 
            className="bg-green-500 bg-opacity-30"
            onClick={() => onJoin && onJoin(eventId)}
          >
            Join
          </GlassButton>
        )}
      </div>
    </div>
  );
}