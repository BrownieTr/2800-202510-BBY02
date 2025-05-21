import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '../components/ui/button';

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

      const response = await fetch('http://localhost:3000/api/profile/update', {
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

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            value={formData.email}
            onChange={handleChange}
            disabled={userData?.email ? true : false}
          />
        </div>

        <div>
          <label htmlFor="address" className="block font-medium mb-1">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="country" className="block font-medium mb-1">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="preferences" className="block font-medium mb-1">Sport Preference</label>
          <input
            type="text"
            id="preferences"
            name="preferences"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.preferences}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
