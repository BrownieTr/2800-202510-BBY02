import React from "react";

export default function EventCard({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  participants,
  onJoin 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-600 mb-2">{description}</p>
      <div className="flex justify-between text-sm mb-2">
        <div>
          <p><strong>Date:</strong> {date}</p>
          {time && <p><strong>Time:</strong> {time}</p>}
        </div>
        <p><strong>Location:</strong> {location}</p>
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm"><strong>Participants:</strong> {participants}</p>
        <button 
          onClick={onJoin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Join
        </button>
      </div>
    </div>
  );
}