import { useState, useEffect } from 'react';
import GlassButton from '../components/ui/glassButton';
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
    <div className="w-full">
      {isEditing ? (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <ProfileEditForm
            userData={userData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Profile Details</h2>
            
            <div className="divide-y divide-white divide-opacity-10">
              {details.map(detail => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between py-3"
                >
                  <h3 className="text-white opacity-80 font-medium">{detail.title}</h3>
                  <div className="text-white text-sm md:text-base">{detail.detail}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <GlassButton onClick={() => handleButtonClick(0)}>
                Back
              </GlassButton>
              <GlassButton onClick={() => handleButtonClick(100)}>
                Edit
              </GlassButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}