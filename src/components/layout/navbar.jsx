import React, { useState } from "react";
import Button from "../ui/button";
import Menu from "../ui/menu";
import ClickableIcons from "../ui/clickableIcons";

export default function Navbar({ brandName = "Your Brand" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    { label: "Home" },
    { label: "About" },
    { label: "Contact" },
  ];
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full py-4 px-6">
      <div className="flex justify-between items-center">
        <div>{brandName}</div>
        <ClickableIcons icon="☰" onClick={toggleMenu}/>
      </div>
      {isMenuOpen && <Menu items={menuItems} />}
    </nav>
  );
}
