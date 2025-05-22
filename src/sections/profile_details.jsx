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
    <section className="px-4 py-2 w-full max-w-3xl mx-auto">
      {isEditing ? (
        <ProfileEditForm
          userData={userData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <div className="border-t border-gray-500 divide-y divide-gray-500">
            {details.map(detail => (
              <div
                key={detail.id}
                className="flex items-center justify-between px-4 py-3 bg-white transition-colors"
              >
                <h3 className="text-base md:text-lg font-medium">{detail.title}</h3>
                <div className="text-gray-500 text-sm md:text-base">{detail.detail}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 flex-wrap">
            <Button className="text-white bg-blue-600 hover:bg-blue-700" onClick={() => handleButtonClick(0)}>
              Back
            </Button>
            <Button className="text-white bg-blue-600 hover:bg-blue-700" onClick={() => handleButtonClick(100)}>
              Edit
            </Button>
          </div>
        </>
      )}
    </section>
  );
}