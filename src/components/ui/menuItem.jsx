import React from "react";
import Link from "./link";

export default function menuItem({ label = "label", onClick, to }) {
  if (to) {
    return (
      <Link
        to={to}
        component={
          <div className="flex items-center justify-between px-6 py-2 cursor-pointer">
            <span className="text-base">{label}</span>
          </div>
        }
      ></Link>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-6 py-2 hover:bg-gray-700 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-white text-base">{label}</span>
    </div>
  );
}
