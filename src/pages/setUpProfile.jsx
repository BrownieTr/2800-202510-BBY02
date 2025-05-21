import React from "react";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import ClickableIcons from "../components/ui/clickableIcons";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function setUpProfile() {
  const [isUsernameVisible, setIsUsernameVisible] = useState(true);
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [isSportVisible, setIsSportVisible] = useState(false);
  const [selectedSports, setSelectedSports] = useState([]);
  const [usernameError, setUsernameError] = useState("");
  const [createAccountError, setCreateAccountError] = useState(""); // New state for account creation error
  const navigate = useNavigate();
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
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const { user, getAccessTokenSilently } = useAuth0();

  const checkUsername = async () => {
    const token = await getAccessTokenSilently();
    
    // Clear any previous errors
    setUsernameError("");
    
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

      setIsUsernameVisible(false);
      setIsAddressVisible(true);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameError("There was an error checking username availability. Please try again later.");
    }
  };

  const nextAddress = () => {
    setIsAddressVisible(false);
    setIsSportVisible(true);
  };

  const goBackToUsername = () => {
    setIsAddressVisible(false);
    setIsUsernameVisible(true);
  };

  const goBackToAddress = () => {
    setIsSportVisible(false);
    setIsAddressVisible(true);
  };

  const sportSelect = (sport) => {
    setSelectedSports((prevSelectedSports) => {
      if (prevSelectedSports.includes(sport)) {
        return prevSelectedSports.filter((item) => item !== sport);
      } else {
        return [...prevSelectedSports, sport];
      }
    });
  };

  const createAccount = async () => {
    setCreateAccountError("");
    
    try {
      const token = await getAccessTokenSilently();
      
      const userData = {
        name: username,
        address: address,
        country: country,
        preferences: selectedSports.join(", "),
        setUp: true,
        profilePic: user.picture,
        email: user.email
      };
      
      const response = await fetch('http://localhost:3000/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);
      
      navigate("/home");
    } catch (error) {
      console.error('Error creating account:', error);
      setCreateAccountError('There was an error creating your account. Please try again.');
    }
  };

  return (
    <>
      <Navbar header="PlayPal" />
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div
          className={isUsernameVisible ? "flex flex-col flex-grow" : "hidden"}
        >
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
                setUsernameError(""); 
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
        <div
          className={isAddressVisible ? "flex flex-col flex-grow" : "hidden"}
        >
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
