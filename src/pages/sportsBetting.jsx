import React from "react";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";
import ClickableIcons from "../components/ui/clickableIcons";
import BettingCard from "../components/ui/bettingCard";
import { useNavigate } from "react-router-dom";

export default function sportsBetting({
  username = "username",
  balance = "balance",
}) {

  const navigate = useNavigate();
  
  return (
    <>
      <Navbar
        iconLeft={<BackButton />}
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
      <div className="justify-center items-center flex flex-col mt-15">
        <div className="border-2 w-auto h-auto rounded-2xl flex justify-between items-center">
          <h1 className="text-left m-2 font-bold">{username}</h1>
          <p className="text-sm font-bold mr-1">Balance</p>
          <div className="border-1 rounded-2xl">
            <p className="m-1">{balance}</p>
          </div>
          <div className="m-1">
            <ClickableIcons
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M240-160q-66 0-113-47T80-320v-320q0-66 47-113t113-47h480q66 0 113 47t47 113v320q0 66-47 113t-113 47H240Zm0-480h480q22 0 42 5t38 16v-21q0-33-23.5-56.5T720-720H240q-33 0-56.5 23.5T160-640v21q18-11 38-16t42-5Zm-74 130 445 108q9 2 18 0t17-8l139-116q-11-15-28-24.5t-37-9.5H240q-26 0-45.5 13.5T166-510Z" />
                </svg>
              }
            />
          </div>
        </div>
        <div className="mt-5">
          <BettingCard />
          <BettingCard />
          <BettingCard />
          <BettingCard />
        </div>
      </div>
    </>
  );
}
