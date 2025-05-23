import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import GlassButton from '../components/ui/glassButton';

export default function ProfileEditForm({ userData, onSave, onCancel }) {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    address: userData?.address || '',
    country: userData?.country || '',
    preferences: userData?.preferences || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      onSave(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      onSave(formData); // fallback to local update
    }
  };

  const inputBaseClass = "shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="name" className="block text-white text-opacity-80 font-medium mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={inputBaseClass}
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-white text-opacity-80 font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`${inputBaseClass} ${userData?.email ? 'opacity-70 cursor-not-allowed' : ''}`}
            value={formData.email}
            onChange={handleChange}
            disabled={userData?.email ? true : false}
            placeholder="Your email"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-white text-opacity-80 font-medium mb-1">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            className={inputBaseClass}
            value={formData.address}
            onChange={handleChange}
            placeholder="Your address"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-white text-opacity-80 font-medium mb-1">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            className={inputBaseClass}
            value={formData.country}
            onChange={handleChange}
            placeholder="Your country"
          />
        </div>

        <div>
          <label htmlFor="preferences" className="block text-white text-opacity-80 font-medium mb-1">Sport Preference</label>
          <input
            type="text"
            id="preferences"
            name="preferences"
            className={inputBaseClass}
            value={formData.preferences}
            onChange={handleChange}
            placeholder="Your favorite sport"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <GlassButton onClick={onCancel}>
          Cancel
        </GlassButton>
        <GlassButton type="submit">
          Save Changes
        </GlassButton>
      </div>
    </form>
  );
}
