import React from "react";
import Navbar from "../components/layout/navbar";
import ClickableIcons from "../components/ui/clickableIcons";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

// Main component for setting up a user profile
export default function setUpProfile() {
  // State variables to control visibility of different sections
  const [isUsernameVisible, setIsUsernameVisible] = useState(true);
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [isSportVisible, setIsSportVisible] = useState(false);

  // State variables to store user input
  const [selectedSports, setSelectedSports] = useState([]);
  const [usernameError, setUsernameError] = useState(""); // Error message for username validation
  const [createAccountError, setCreateAccountError] = useState(""); // Error message for account creation
  const [username, setUsername] = useState(""); // User's username
  const [address, setAddress] = useState(""); // User's address
  const [country, setCountry] = useState(""); // User's country

  // Auth0 hooks for authentication and navigation
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  // List of sports for user selection
  const sports = [
    "football",
    "baseball",
    "basketball",
    "hockey",
    "fighting",
    "soccer",
    "golfing",
    "tennis",
    "badminton",
    "ultimate",
    "volleyball",
    "cricket",
  ];

  // Function to validate and check if the username is available
  const checkUsername = async () => {
    const token = await getAccessTokenSilently();

    // Clear any previous errors
    setUsernameError("");

    // Validate username input
    if (username.trim() === "") {
      setUsernameError("Username cannot be empty");
      return;
    }

    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphaNumericRegex.test(username)) {
      setUsernameError("Username must contain only letters and numbers");
      return;
    }

    try {
      // Fetch existing users to check for username availability
      const response = await fetch(`http://localhost:3000/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();
      const userExists = users.some((user) => user.name === username);

      if (userExists) {
        setUsernameError("Username already taken. Please choose another one.");
        return;
      }

      // Proceed to the next step if username is valid and available
      setIsUsernameVisible(false);
      setIsAddressVisible(true);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameError("There was an error checking username availability. Please try again later.");
    }
  };

  // Function to navigate to the address input section
  const nextAddress = () => {
    setIsAddressVisible(false);
    setIsSportVisible(true);
  };

  // Function to navigate back to the username input section
  const goBackToUsername = () => {
    setIsAddressVisible(false);
    setIsUsernameVisible(true);
  };

  // Function to navigate back to the address input section
  const goBackToAddress = () => {
    setIsSportVisible(false);
    setIsAddressVisible(true);
  };

  // Function to handle sport selection (toggle selection)
  const sportSelect = (sport) => {
    setSelectedSports((prevSelectedSports) => {
      if (prevSelectedSports.includes(sport)) {
        // Remove sport if already selected
        return prevSelectedSports.filter((item) => item !== sport);
      } else {
        // Add sport to the selection
        return [...prevSelectedSports, sport];
      }
    });
  };

  // Function to create a user account by sending data to the backend
  const createAccount = async () => {
    setCreateAccountError(""); // Clear any previous errors

    try {
      const token = await getAccessTokenSilently();

      // Prepare user data to send to the backend
      const userData = {
        name: username,
        address: address,
        country: country,
        preferences: selectedSports.join(", "), // Convert selected sports to a comma-separated string
        setUp: true, // Indicates that the profile setup is complete
        profilePic: user.picture, // User's profile picture from Auth0
        email: user.email, // User's email from Auth0
      };

      // Send a POST request to update the user's profile
      const response = await fetch('http://localhost:3000/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);

      // Navigate to the home page after successful account creation
      navigate("/home");
    } catch (error) {
      console.error('Error creating account:', error);
      setCreateAccountError('There was an error creating your account. Please try again.');
    }
  };

  return (
    <>
      {/* Navbar component */}
      <Navbar header="PlayPal" />

      {/* Main container */}
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        {/* Username input section */}
        <div className={isUsernameVisible ? "flex flex-col flex-grow" : "hidden"}>
          <div className="mt-10 px-4">
            <h1 className="text-3xl font-bold">Enter your name</h1>
            <input
              type="text"
              placeholder="Enter your username"
              className={`border-2 rounded-lg p-2 mt-4 w-full ${usernameError ? 'border-red-500' : ''}`}
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(""); // Clear error on input change
              }}
            ></input>
            {usernameError && (
              <p className="text-red-500 mt-1 text-sm">{usernameError}</p>
            )}
          </div>
          <div className="mt-auto flex justify-end mb-8">
            <ClickableIcons onClick={checkUsername} icon={"Next"} />
          </div>
        </div>

        {/* Address input section */}
        <div className={isAddressVisible ? "flex flex-col flex-grow" : "hidden"}>
          <div className="mt-10 px-4">
            <h1 className="text-3xl font-bold">Enter your address</h1>
            <div>
              <input
                type="text"
                placeholder="Address Ex. 3700 Willingdon Ave, Burnaby, BC"
                className="border-2 rounded-lg p-2 mt-4 w-full"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></input>
              <input
                type="text"
                placeholder="Country Ex. Canada"
                className="border-2 rounded-lg p-2 mt-4 w-full"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="mt-auto flex gap-4 justify-between mb-8">
            <ClickableIcons onClick={goBackToUsername} icon={"Back"} />
            <ClickableIcons onClick={nextAddress} icon={"Next"} />
          </div>
        </div>

        {/* Sport selection section */}
        <div className={isSportVisible ? "flex flex-col flex-grow" : "hidden"}>
          <div className="items-center justify-center mt-6 px-4">
            <h1>Select your favourite sport</h1>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-xl grid grid-cols-3 gap-4 px-4">
              {sports.map((sport, index) => (
                <button
                  key={index}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all 
                    ${
                      selectedSports.includes(sport)
                        ? "bg-blue-500 text-white font-bold border-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  onClick={() => sportSelect(sport)}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col mb-8 px-8">
            <div className="flex justify-between">
              <ClickableIcons onClick={goBackToAddress} icon="Back" />
              <ClickableIcons onClick={createAccount} icon="Create Account" />
            </div>
            {createAccountError && (
              <p className="text-red-500 text-center mt-2 text-sm">{createAccountError}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
