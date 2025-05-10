import React, {useEffect, useState} from 'react';
import Button from '../components/ui/button';

export default function Profile_Details({onButtonClick}) {

    const [details, setDetails] = useState([
        { id: 1, title: "Name", detail: "..." },
        { id: 2, title: "Email", detail: "..." },
        { id: 3, title: "Address", detail: "..." },
        { id: 4, title: "Country", detail: "..." },
        { id: 5, title: "Sport Preference", detail: "..." }
      ]);

      // Functionality under testing
      useEffect(() => {
        fetch('http://localhost:3000/profile')
          .then(res => res.json())
          .then(data => {
            const updatedDetails = details.map(item => {
              const value = data[0][item.title.toLowerCase()];
              return {
                ...item,
                detail: value || item.detail,
              };
            });
            setDetails(updatedDetails);
          });
      }, []);

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
            <Button className='profile-buttons' onClick={() => handleButtonClick(100)}>Edit</Button>
        </div>

    </section>
    );
}