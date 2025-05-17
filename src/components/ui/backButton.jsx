import React from "react";
import ClickableIcons from "./clickableIcons";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const lastPage = useNavigate();
  const strokeWidth = 0.65;

  return (
    <>
      <div onClick={() => lastPage(-1)} className="pr-2">
        <svg xmlns="http://www.w3.org/2000/svg" 
        fill="none" viewBox="0 0 24 24" 
        strokeWidth={strokeWidth} 
        stroke="currentColor" 
        id="back-arrow" 
        className="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
        </svg>
      </div>
    </>
  );
}
