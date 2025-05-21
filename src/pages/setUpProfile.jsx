import React from "react";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import ClickableIcons from "../components/ui/clickableIcons";
import { useState } from "react";

export default function setUpProfile() {
  const [isUsernameVisible, setIsUsernameVisible] = useState(true);
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [isSportVisible, setIsSportVisible] = useState(false);
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
  const nextUsername = () => {
    setIsUsernameVisible(false);
    setIsAddressVisible(true);
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

  return (
    <>
      <Navbar header="PlayPal" />
      <div className="flex flex-col min-h-[calc(100vh-64px)]"> {/* Adjust 64px if your navbar has different height */}
        <div className={isUsernameVisible ? "flex flex-col flex-grow" : "hidden"}>
          <div className="mt-10 px-4">
            <h1 className="text-3xl font-bold">Enter your name</h1>
            <input
              type="text"
              placeholder="Enter your username"
              className="border-2 rounded-lg p-2 mt-4 w-full"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </div>
          <div className="mt-auto flex justify-end mb-8">
            <ClickableIcons
              onClick={nextUsername}
              icon={"Next"}
            />
          </div>
        </div>

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
            <ClickableIcons
              onClick={goBackToUsername}
              icon={"Back"}
            />
            <ClickableIcons
              onClick={nextAddress}
              icon={"Next"}
            />
          </div>
        </div>

        {/* Sport selection section - already has buttons at bottom */}
        <div
          className={
            isSportVisible ? "flex flex-col flex-grow" : "hidden"
          }
        >
          <div className="items-center justify-center mt-6 px-4">
            <h1>Select your favourite sport</h1>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-xl grid grid-cols-3 gap-4 px-4">
              {sports.map((sport, index) => (
                <button
                  key={index}
                  className="aspect-square rounded-lg border-2 flex items-center justify-center"
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between mb-8 px-8">
            <ClickableIcons onClick={goBackToAddress} icon="Back" />
            <ClickableIcons to="/home" icon="Skip" />
          </div>
        </div>
      </div>
    </>
  );
}
