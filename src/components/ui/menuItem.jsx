import React from "react";

export default function menuItem({ label = "label", onClick }) {
  return (
    <div
      className="flex items-center justify-between px-6 py-2 hover:bg-gray-700 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-white text-base">{label}</span>
    </div>
  );
}
