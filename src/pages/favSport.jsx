import React from "react";
import Button from "../components/ui/button";
import ClickableIcons from "../components/ui/clickableIcons";

export default function favSport() {
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
  return (
    <div className="flex flex-col h-screen p-6">
      <div className="flex-1 flex items-center justify-center">
        <h1>Select your favourite sport</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl grid grid-cols-3 gap-4 mb-8">
            {sports.map(sports=>(
                <Button children={sports}/>
            ))}
        </div>
      </div>
      <div className="flex justify-end mb-3">
            <ClickableIcons icon="skip"/>
      </div>
    </div>
  );
}
