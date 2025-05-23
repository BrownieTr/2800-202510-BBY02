import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const lastPage = useNavigate();
  const strokeWidth = 0.65;

  return (
    <>
      <div onClick={() => lastPage(-1)} className="pr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20px"
          viewBox="0 -960 960 960"
          width="20px"
          fill="#FFFFFF"
        >
          <path d="m330-444 201 201-51 51-288-288 288-288 51 51-201 201h438v72H330Z" />
        </svg>
      </div>
    </>
  );
}
