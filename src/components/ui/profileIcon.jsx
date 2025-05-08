import React from "react";

export default function profileIcon({profilePic, size}){
    return(
        <img src={profilePic} alt="Profile picture" className={`rounded-full w-${size} h-${size} object-center`}></img>
    );
}