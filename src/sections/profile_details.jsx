import { useState, useEffect } from 'react';
import Button from '../components/ui/button';
import ProfileEditForm from './profileEditForm';

export default function Profile_Details({ onButtonClick, userData, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState([
    { id: 1, title: "Name", detail: "..." },
    { id: 2, title: "Email", detail: "..." },
    { id: 3, title: "Address", detail: "..." },
    { id: 4, title: "Country", detail: "..." },
    { id: 5, title: "Sport Preference", detail: "..." }
  ]);

  useEffect(() => {
    if (userData) {
      // Update details with the userData
      const updatedDetails = [
        { id: 1, title: "Name", detail: userData.name || "Not set" },
        { id: 2, title: "Email", detail: userData.email || "Not set" },
        { id: 3, title: "Address", detail: userData.address || "Not set" },
        { id: 4, title: "Country", detail: userData.country || "Not set" },
        { id: 5, title: "Sport Preference", detail: userData.preferences || "Not set" }
      ];

      setDetails(updatedDetails);
    }
  }, [userData]);

  const handleButtonClick = (id) => {
    if (id === 100) {
      // Edit button clicked
      setIsEditing(true);
    } else {
      onButtonClick(id);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedData) => {
    // Update local state with the updated data
    const updatedDetails = [
        { id: 1, title: "Name", detail: updatedData.name || "Not set" },
        { id: 2, title: "Email", detail: updatedData.email || "Not set" },
        { id: 3, title: "Address", detail: updatedData.address || "Not set" },
        { id: 4, title: "Country", detail: updatedData.country || "Not set" },
        { id: 5, title: "Sport Preference", detail: updatedData.preferences || "Not set" }
    ];
    
    setDetails(updatedDetails);
    setIsEditing(false);
    
    // Notify parent component about the update
    if (onProfileUpdate) {
      onProfileUpdate(updatedData);
    }
  };

  return (
    <section>
      {isEditing ? (
        <ProfileEditForm
          userData={userData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}