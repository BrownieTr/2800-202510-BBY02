// Create a new file called ProfileEditForm.jsx in your sections folder
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
        preferences: userData?.preferences || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Get the auth token
            const token = await getAccessTokenSilently();
            
            // Send updated data to server
            const response = await fetch('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            
            const updatedProfile = await response.json();
            
            // Call the onSave callback with the updated data
            onSave(updatedProfile);
        } catch (error) {
            console.error('Error updating profile:', error);
            // Still call onSave with the form data so UI updates
            // even if server update fails
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={userData?.email ? true : false} // Disable if email is from Auth0
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="preferences">Sport Preference</label>
                    <input
                        type="text"
                        id="preferences"
                        name="preferences"
                        value={formData.preferences}
                        onChange={handleChange}
                    />
                </div>
            </div>
            
            <div className="button-group">
                <Button type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
}