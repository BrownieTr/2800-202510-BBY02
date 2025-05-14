import React from "react";
import { Link } from "react-router-dom";
import ClickableIcons from "../ui/clickableIcons";

export default function Navbar({
  iconLeft,
  iconRight,
  iconRight2,
  header = "header",
  iconLeftTo,
  iconRightTo,
  iconRight2To,
}) {
  return (
    <nav className="flex items-center justify-between ">
      <div>
        <ClickableIcons icon={iconLeft} to={iconLeftTo} />
      </div>
      <div className="flex-1 text-left">
        <h2>{header}</h2>
      </div>
      <div className="w-10 text-right">
        <ClickableIcons icon={iconRight} to={iconRightTo} />
      </div>
      <div className="w-10 text-right">
        <ClickableIcons icon={iconRight2} to={iconRight2To} />
      </div>
    </nav>
  );
}
