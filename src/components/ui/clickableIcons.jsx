import React from "react";
import Link from "./link";

export default function clickableIcons({ icon, to, onClick }) {
  if (to) {
    return <Link to={to} component={icon} />;
  }
  return <button onClick={onClick}>{icon}</button>;
}
