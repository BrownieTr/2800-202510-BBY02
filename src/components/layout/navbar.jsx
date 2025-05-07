import React, { useState } from "react";
import Button from "../ui/button";
import Menu from "../ui/menu";

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
        <Button children="☰" onClick={toggleMenu} />
      </div>
      {isMenuOpen && <Menu items={menuItems} />}
    </nav>
  );
}
