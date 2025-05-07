import React from 'react';
import Button from '../ui/button';

export default function Navbar() {
  return (
    <nav>
      <div className="logo">PlayPal</div>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <Button>Sign Up</Button>
    </nav>
  );
}