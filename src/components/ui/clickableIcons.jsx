import React from "react";
import Link from "./link";

export default function clickableIcons({ icon, to, onClick }) {
  return (
    <Link to={to} component={icon} onClick={onClick}/>
  );
}
