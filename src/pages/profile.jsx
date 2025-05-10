import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import Options from '../sections/options.jsx';
import Profile_Details from '../sections/profile_details.jsx';

export default function Profile() {

    const strokeWidth = 0.65;
    const [view, setView] = useState("profile");
    const handleOptionClick = (whichOptionClicked => {
        if (whichOptionClicked === 2) {
            setView("details");
        } else if (whichOptionClicked === 3) {
            setView("settings");
        } else {
            setView("profile");
        }
    })

    return (
        <div>
            <header>
                <nav className='profile-nav'>
                    <Link to="/">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor" id="back-arrow" className="icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                        </svg>
                    </Link>
                    <h3> Profile </h3>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor" className="bell">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                </nav>
            </header>

            <main>
                <section className="profile">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor" id="profile-picture">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <h1 id="profile-name"> Your Name</h1>
                </section>

                {view === "profile" && <Options onOptionClick={handleOptionClick}/>}
                {view === "details" && <Profile_Details onButtonClick={handleOptionClick}/>}
                {view ==="settings" && <Settings></Settings>}
            </main>
        </div>
    );
}   