import { Link } from 'react-router-dom';
import Button from '../ui/button';

export default function Navbar() {
  return (
    <nav>
      <div className="logo">Your Brand</div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/location">Location Service (in Test)</Link></li>
      </ul>
      <Button>Sign Up</Button>
    </nav>
  );
}