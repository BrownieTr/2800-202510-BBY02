import React, {useState} from 'react';
import Button from '../components/ui/button';

export default function Profile_Details({onButtonClick}) {

    const details = [
        {
            id: 1,
            title: "Name",
            detail: "..."
        },
        {
            id: 2,
            title: "Email",
            detail: "..."
        },
        {
            id: 3,
            title: "Phone",
            detail: "..."
        },
        {
            id: 4,
            title: "Address",
            detail: "..."
        }
    ];

    const handleButtonClick = (id) => {
        onButtonClick(id);
    }   

    return (
        <section>
        <div className="profile-grid">
            {details.map(detail => (
                <div key={detail.id} className="profile-card">
                    <h3>{detail.title}</h3>
                    <div className="detail">{detail.detail}</div>
                </div>
            ))}
        </div>
        <div>
            <Button className='profile-buttons' onClick={() => handleButtonClick(0)}>Back</Button>
            <Button className='profile-buttons' onClick={() => handleButtonClick(3)}>Edit</Button>
        </div>

    </section>
    );
}