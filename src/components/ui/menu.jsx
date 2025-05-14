import React from "react";
import MenuItem from "./menuItem";

export default function menu({ items }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-md">
      {items.map((item, index) => (
        <MenuItem key={index} label={item.label} onClick={item.onClick} to={item.to} />
      ))}
    </div>
  );
}
