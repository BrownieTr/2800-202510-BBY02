import React from 'react';

export default function Options({onOptionClick}) {
    const options = [
        {
            id: 2,
            icon: <svg xmlns="http://www.w3.org/2000/svg"
                       width="20" height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>,
            title: "Profile details"
        },
        {
            id: 3,
            icon: <svg xmlns="http://www.w3.org/2000/svg"
                       width="20" height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>,
            title: "Settings"
        },
        {
            id: 4,
            icon: <svg xmlns="http://www.w3.org/2000/svg"
                       width="20" height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>,
            title: "Log out"
        }
    ];
    
    const handleClick = (id) => {
        onOptionClick(id);
    }

    return (
        <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Options</h2>
            
            <div>
                {options.map(option => (
                    <div
                        key={option.id}
                        className="flex items-center py-2 cursor-pointer transition-all duration-300 border hover:bg-black hover:bg-opacity-30 rounded-lg px-3 transition duration-300 ease-in-out hover:bg-opacity-20 hover:scale-105"
                        onClick={() => handleClick(option.id)}
                    >
                        <div className="w-10 h-10 flex items-center justify-center bg-opacity-10 rounded-full mr-4">
                            {option.icon}
                        </div>
                        <h3 className="text-white text-lg font-medium">
                            {option.title}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
}