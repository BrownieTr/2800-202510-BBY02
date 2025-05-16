import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Options from '../sections/options.jsx';
import Profile_Details from '../sections/profile_details.jsx';

export default function Profile() {
    // Define strokeWidth here as a constant at the component level
    const strokeWidth = 0.65;
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [userData, setUserData] = useState(null);
    const [view, setView] = useState("profile");
    const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
    });
    
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);
    
    useEffect(() => {
        const className = 'dark-mode';
        const element = document.documentElement; // or document.body

        if (darkMode) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }

        // Optional cleanup if your component unmounts:
        return () => {
            element.classList.remove(className);
        };
    }, [darkMode]);


    // Fetch user data when component loads
    useEffect(() => {
        const fetchUserData = async () => {
            if (!isAuthenticated) return;
            
            try {
                // Get token
                const token = await getAccessTokenSilently();
                
                // Fetch profile
                const response = await fetch('http://localhost:3000/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Profile data:", data);
                    setUserData(data);
                } else {
                    console.error("Error fetching profile");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };
        
        fetchUserData();
    }, [isAuthenticated, getAccessTokenSilently]);
    
    const handleOptionClick = (whichOptionClicked) => {
        if (whichOptionClicked === 1) {
            // Dark mode toggle
            setDarkMode(prev => !prev);
        } else if (whichOptionClicked === 2) {
            setView("details");
        } else if (whichOptionClicked === 3) {
            setView("settings");
        } else {
            setView("profile");
        }
    };

    
    const handleProfileUpdate = (updatedData) => {
        setUserData(prevData => ({
            ...prevData,
            ...updatedData
        }));
    };
    
    // Display loading when Auth0 is still loading
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    // Get display name from userData or Auth0 user
    const displayName = userData?.name || (user ? (user.name || user.nickname) : "Your Profile");

    return (
        <div className={darkMode ? 'dark-mode' : ''}>
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
                    {(userData?.picture || user?.picture) ? (
                        <img 
                            src={userData?.picture || user?.picture} 
                            alt="Profile" 
                            id="profile-picture" 
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor" id="profile-picture">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    )}
                    <h1 id="profile-name">{displayName}</h1>
                </section>

                {view === "profile" && <Options onOptionClick={handleOptionClick}/>}
                {view === "details" && (
                    <Profile_Details 
                        onButtonClick={handleOptionClick} 
                        userData={userData}
                        onProfileUpdate={handleProfileUpdate}
                    />
                )}
                {view === "settings" && <div>Settings</div>}
            </main>
        </div>
    );
}