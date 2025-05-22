import React from "react";
import { useNavigate } from "react-router-dom";

export default function GlassNavbar({
  title = "PlayPal",
  leftIcon,
  rightIcon,
  rightIcon2,
  onLeftIconClick,
  onRightIconClick,
  onRightIcon2Click,
}) {
  const navigate = useNavigate();

  return (
    <header className="glass-navbar">
      <h1>{title}</h1>
      
      <div className="glass-navbar-actions">
        {leftIcon && (
          <button className="glass-icon-button" onClick={onLeftIconClick}>
            {leftIcon}
          </button>
        )}
        
        <div className="flex gap-2">
          {rightIcon && (
            <button className="glass-icon-button" onClick={onRightIconClick}>
              {rightIcon}
            </button>
          )}
          
          {rightIcon2 && (
            <button className="glass-icon-button" onClick={onRightIcon2Click}>
              {rightIcon2}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}