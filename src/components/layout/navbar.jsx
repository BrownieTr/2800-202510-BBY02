import React from "react";
import { Link } from 'react-router-dom';
import ClickableIcons from "../ui/clickableIcons";


export default function Navbar({iconLeft, iconRight, header = "header"}) {
  return (
    <nav className="flex items-center justify-between px-4 py-3 ">
      <div className="w-10">
        <ClickableIcons icon={iconLeft} />
      </div>
      <div className="flex-1 text-left pl-4">
        <h4>{header}</h4>
      </div>
      <div className="w-10 text-right">
        <ClickableIcons icon={iconRight} />
      </div>
      <ul>
        Link to test functionality
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/location">Location Service</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/chat">Chat</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
}
