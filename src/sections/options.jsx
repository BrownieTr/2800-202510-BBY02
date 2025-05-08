import React from 'react';

export default function Options() {
    const options = [
        {
            id: 1,
            icon: "",
            title: "Profile details"
        },
        {
            id: 2,
            icon: "",
            title: "Settings"
        },
        {
            id: 3,
            icon: "",
            title: "Log out"
        }
    ];

    return (
        <section id="profiles">
        <div className="profile-grid">
            {options.map(profile => (
                <div key={profile.id} className="profile-card">
                    <div className="profile-icon">{profile.icon}</div>
                    <h4>{profile.title}</h4>
                </div>
            ))}
        </div>
    </section>
    );
}