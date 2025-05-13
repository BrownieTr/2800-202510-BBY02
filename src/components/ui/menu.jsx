import React from "react";
import MenuItem from "./menuItem";

export default function menu({ items }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      {items.map((item, index) => (
        <MenuItem key={index} label={item.label} onClick={item.onClick} to={item.to} />
      ))}
    </div>
  );
}
