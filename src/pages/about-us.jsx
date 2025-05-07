import React from 'react';
import Navbar from '../components/layout/navbar';
import Features from '../sections/features';
import Footer from '../components/layout/footer';

export default function Landing() {
    return (
        <div>
            <header>
                <div>
                    <Navbar brandName='PlayPal' />
                </div>
            </header>

            <main>
                <section id="hero">
                    <h2>PlayPal</h2>
                    <p>Find People to play Sports Online</p>
                    <button>Get Started</button>
                </section>
                <Features />
            </main>
            <Footer brandName='PlayPal'/>
        </div>
    );
}