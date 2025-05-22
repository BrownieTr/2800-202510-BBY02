import React from "react";
import { Link } from "react-router-dom";
import ClickableIcons from "../ui/clickableIcons";
import Button from "../ui/button";
import { useState } from "react";

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
    <nav className="flex items-center justify-between py-4">
      <div>
        <ClickableIcons icon={iconLeft} to={iconLeftTo} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-2xl">{header}</p>
      </div>
      <div className="w-10 text-right">
        <ClickableIcons icon={iconRight} to={iconRightTo} />
      </div>
      <div className="text-right">
        <Button onClick={iconRight2To}> {iconRight2} </Button>
      </div>
    </nav>
  );
}
