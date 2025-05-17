import React from "react";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";
import ClickableIcons from "../components/ui/clickableIcons";
import BettingCard from "../components/ui/bettingCard";

export default function sportsBetting({
  username = "username",
  balance = "balance",
}) {
  return (
    <>
      <Navbar
        iconLeft={<BackButton />}
        header="PlayPal"
        iconRight2={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
          </svg>
        }
        iconRight2To={"/messages"}
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
