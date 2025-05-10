import React from "react";
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
    </nav>
  );
}
