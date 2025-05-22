
import React, { useState } from "react";
import Navbar from '../components/layout/navbar';
import Features from '../sections/features';
import Footer from '../components/layout/footer';
import LoginButton from '../components/ui/LoginButton';
import Menu from "../components/ui/menu";
import Button from "../components/ui/button";

export default function Landing() {
  const menuItems = [
    { label: "Home", to: "/home" },
    { label: "About", to: "/about" },
    { label: "Location Services", to: "/location" },
    { label: "Events", to: "/events" },
    { label: "Chat", to: "/chat" },
    { label: "Profile", to: "/profile" },
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <header>
        <div className="relative">
          <Navbar
            header="PlayPal"
            iconRight2={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#000000">
                    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                  </svg>}
            iconRight2To={
                toggleMenu}
          />
          {isMenuOpen && <Menu items={menuItems} />}
        </div>
      </header>

      <main>
        <section id="hero">
          <h2>PlayPal</h2>
          <p>Find People to play Sports Online</p>
          <button>Get Started</button>
        </section>
        <Features />
        <LoginButton />
      </main>
      <Footer brandName="PlayPal" />
    </div>
  );
}
