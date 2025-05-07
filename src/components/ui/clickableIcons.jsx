import React from "react";

export default function clickableIcons({icon = '#', link = '#'}){
    return(
        <a className="no-underline visited:text-inherit" href={link}>{icon}</a>
    );
}