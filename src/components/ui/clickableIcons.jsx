import React from "react";

export default function clickableIcons({icon = '#', link = '#', onClick}){
    return(
        <a onClick={onClick} className="no-underline visited:text-inherit" href={link}>{icon}</a>
    );
}