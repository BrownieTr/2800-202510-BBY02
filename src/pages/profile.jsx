import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Options from '../sections/options.jsx';
import Profile_Details from '../sections/profile_details.jsx';
import BackButton from '../components/ui/backButton.jsx';
import LogoutPopUp from '../components/ui/logoutPopUp.jsx';

export default function Profile() {
    // Define strokeWidth here as a constant at the component level
    const strokeWidth = 0.65;
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [userData, setUserData] = useState(null);
    const [view, setView] = useState("profile");

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
        switch (whichOptionClicked) {
            case 1: break;
            case 2: setView("details"); break;
            case 3: setView("settings"); break;
            case 4: setView("logout"); break;
            default: setView("profile"); break;
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
    const displayName = userData?.name 
    || (user ? (user.name || user.nickname) : "Your Profile");

    return (
        <div>
            <header>
                <nav className="mb-4 flex items-center justify-between py-3 h-16 bg-white">
                    <BackButton />
                    <h3 className="text-lg font-semibold">Profile</h3>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        className="w-8 h-8 bell"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 
                        8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 
                        1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 
                        24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                    </svg>
                </nav>
            </header>


            <main>
                <section className="justify-self-center w-48">
                    {(userData?.picture || user?.picture) ? (
                        <img 
                            src={userData?.picture || user?.picture} 
                            alt="Profile" 
                            className="justify-self-center" 
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" 
                        fill="none" viewBox="0 0 24 24" 
                        strokeWidth={strokeWidth} 
                        stroke="currentColor" 
                        className="justify-self-center">
                            <path strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 
                            7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 
                            0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 
                            1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    )}
                    <h1 className="mt-0 mb-4">{displayName}</h1>
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
                {view === "logout" && (<LogoutPopUp onOptionClick={handleOptionClick}/>)}
            </main>
        </div>
    );
}