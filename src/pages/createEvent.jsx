import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassNavbar from "../components/layout/glassNavbar";
import { forwardRef } from "react";
import ChatIcon from "../components/ui/chatIcon";

export default function CreateEvent() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validate form
    if (!formData.name || !formData.date || !formData.location) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get Auth0 token
      const token = await getAccessTokenSilently();
      
      // Send data to backend
      const response = await fetch('http://localhost:3000/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const data = await response.json();
      console.log("Event created:", data);
      
      // Navigate back to events page after successful creation
      alert("Event created successfully!");
      navigate("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      setError(error.message || "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

    // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  // Custom input using forwardRef to make the popover work
  const CustomTimeInput = forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>
      {value}
    </button>
  ));

  const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      type="button"
      className="w-full shadow appearance-none border rounded py-2 px-3 bg-gray-800 text-white text-left leading-tight focus:outline-none focus:shadow-outline flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>{value || "Select a date"}</span>
    </button>
  ));


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      {/* Background decoration */}
      <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
      bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px]
      bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>

      <GlassNavbar
        title="Events"
        leftIcon={backIcon}
        rightIcon2={<ChatIcon/>}
        onLeftIconClick={() => navigate(-1)}
        onRightIcon2Click={() => navigate("/messages")}
      />

      <div className="container mx-auto px-4 py-6 pt-20">
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-white-700 text-sm font-bold mb-2">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Event Name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-white-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event Description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              />
            </div>
            
            <div className="flex flex-row md:flex-row justify-between gap-4">
              {/* Date */}
              <div className=" md:w-1/2">
                <label className="block text-white text-sm font-bold mb-2">Date *</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setFormData({
                      ...formData,
                      date: date?.toISOString().split("T")[0] || "",
                    });
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select a date"
                  customInput={
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  }
                  required
                />
              </div>

              {/* Time */}
              <div className="md:w-1/2">
                <label className="block text-white text-sm font-bold mb-2">Time*</label>
                <DatePicker
                  selected={selectedTime}
                  onChange={(date) => setSelectedTime(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  customInput={
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-white-700 text-sm font-bold mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}