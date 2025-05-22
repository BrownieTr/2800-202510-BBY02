import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import Button from "./button.jsx";

const LogoutPopUp = ({onOptionClick}) => {
  const { logout } = useAuth0();
  
    const handleClick = (id) => {
        onOptionClick(id);
    }

  return (
<div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
  <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-6 animate-fadeIn">
    <h2 className="text-xl font-semibold text-gray-800">
      Are you sure you want to log out?
    </h2>

    <div className="flex justify-center gap-4">
      <Button 
        className="bg-blue-600 hover:bg-blue-700" 
        onClick={() => handleClick(0)}>Cancel</Button>
      <Button
        className="bg-red-600 hover:bg-red-700"
        onClick={() =>
          logout({
            logoutParams: { returnTo: window.location.origin },
          })
        }
      >
        Log out
      </Button>
    </div>
  </div>
</div>

  );
};

export default LogoutPopUp;