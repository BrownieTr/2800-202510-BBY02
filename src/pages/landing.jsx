// src/pages/Landing.jsx
import React from 'react';
import Navbar from '../components/layout/navbar';

export default function Landing() {
    return (
        <div>
            <header>
                <div>
                    <Navbar />
                </div>
            </header>

            <main>
                <section id="hero">
                    <h2>PlayPal</h2>
                    <p>Find People to play Sports Online</p>
                    <button>Get Started</button>
                </section>

                <section id="features">
                    <h2>Features</h2>
                    <div>
                        <h3>Feature 1</h3>
                        <p>Description of feature 1</p>
                    </div>
                    <div>
                        <h3>Feature 2</h3>
                        <p>Description of feature 2</p>
                    </div>
                    <div>
                        <h3>Feature 3</h3>
                        <p>Description of feature 3</p>
                    </div>
                </section>

                <section id="contact">
                    <h2>Contact Us</h2>
                    <form>
                        <div>
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" />
                        </div>
                        <div>
                            <label htmlFor="message">Message</label>
                            <textarea id="message"></textarea>
                        </div>
                        <button type="submit">Send</button>
                    </form>
                </section>
            </main>

            <footer>
                <p>&copy; 2025 Your App. All rights reserved.</p>
            </footer>
        </div>
    );
}