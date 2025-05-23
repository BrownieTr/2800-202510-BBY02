import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import GlassNavbar from '../components/layout/glassNavbar';
import GlassTabBar from '../components/layout/glassTabBar';
import GlassButton from '../components/ui/glassButton';
import Options from '../sections/options.jsx';
import Profile_Details from '../sections/profile_details.jsx';
import LogoutPopUp from '../components/ui/logoutPopUp.jsx';
import ChatIcon from '../components/ui/chatIcon.jsx';

export default function Profile() {
    const navigate = useNavigate();
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
                const response = await fetch('/api/profile', {
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
    
    // Back icon
    const backIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    );

    
    // Display loading when Auth0 is still loading
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                <div className="bg-circle bg-circle-1"></div>
                <div className="bg-circle bg-circle-2"></div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 relative mb-4">
                        <div className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></div>
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-white text-xl font-semibold">Loading profile...</p>
                </div>
            </div>
        );
    }
    
    // Get display name from userData or Auth0 user
    const displayName = userData?.name
    || (user ? (user.name || user.nickname) : "Your Profile");

    return (
        <div>
            {/* Background decoration */}
            <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
            bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
            </div>
            <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px] 
            bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
            </div>
            
            <GlassNavbar
                title="Sports Betting"
                leftIcon={backIcon}
                rightIcon2={<ChatIcon/>}
                onLeftIconClick={() => navigate("/home")}
                onRightIcon2Click={() => navigate("/messages")}
            />
            
            <div className="app-container">
                <main className="main-content">
                    <div className="glass-card text-center">
                        <div className="flex flex-col items-center">
                            {(userData?.picture || user?.picture) ? (
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white border-opacity-30 mb-4">
                                    <img
                                        src={userData?.picture || user?.picture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white bg-opacity-10 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            )}
                            <h1 className="text-xl font-bold">{displayName}</h1>
                        </div>
                    </div>

                    {view === "profile" && <Options onOptionClick={handleOptionClick}/>}
                    {view === "details" && (
                        <Profile_Details
                            onButtonClick={handleOptionClick}
                            userData={userData}
                            onProfileUpdate={handleProfileUpdate}
                        />
                    )}
                    {view === "settings" && (
                        <div className="glass-card">
                            <h2>Settings</h2>
                            <p className="mt-4 text-white text-opacity-80">Settings page is under construction.</p>
                            <div className="flex justify-end mt-4">
                                <GlassButton onClick={() => setView("profile")}>Back</GlassButton>
                            </div>
                        </div>
                    )}
                    {view === "logout" && (<LogoutPopUp onOptionClick={handleOptionClick}/>)}
                </main>
            </div>
            
            <GlassTabBar />
        </div>
    );
}