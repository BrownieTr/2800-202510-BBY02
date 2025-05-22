import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/navbar";
import Link from "../components/ui/link";
import ClickableIcons from "../components/ui/clickableIcons";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button";

export default function Index() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [user, setUser] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const fetchUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json()
      setUser(data || {}); // Use data directly instead of data.user
      console.log(data.setUp)
      if(data.setUp === false){
        navigate("/setUpProfile");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(error.message);
    }
  };

  return (
    <>
      <Navbar
        header="PlayPal"
        iconRight={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
          </svg>
        }
        iconRightTo={() => navigate('/profile')}
        iconRight2={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
            className="ml-auto"
          >
            <path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
          </svg>
        }
        iconRight2To={() => navigate('/messages')}
      />
      <h1 className="mt-20 text-2xl font-bold text-center">
        Welcome {user.name || "username"}
      </h1>

      <div className="mt-30 flex items-center justify-between space-x-4">
        <Button 
        className="rounded-xl w-40 h-56 bg-gray-200 flex 
          items-center justify-center text-lg text-black"
        onClick={() => navigate("/events")}>
          Events
        </Button>
        <Button
        className="rounded-2xl w-40 h-56 bg-gray-200 flex items-center justify-center text-lg"
        onClick={() => navigate("/sportsBetting")}>
          Sports Betting
        </Button>
      </div>

      <div className="mt-30 flex items-center justify-center space-x-4">
        <button className="rounded-xl w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-center flex-col">
          <div>match</div>
          <div>settings</div>
        </button>
        <Button 
        className="rounded-xl w-36 h-20 bg-gray-200 flex 
        items-center justify-center text-lg text-black"
        onClick={() => navigate("/findingMatch")}>
          Find Match
        </Button>
        <button className="rounded-xl w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-center flex-col">
          <div>create</div>
          <div>match</div>
        </button>
      </div>
    </>
  );
}
