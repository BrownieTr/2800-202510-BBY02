import React from "react";
import Navbar from "../components/layout/navbar";
import ClickableIcons from "../components/ui/clickableIcons";

export default function findingMatch({
  sport = "sport",
  matchSetting = "sportsSettings",
}) {
  return (
    <>
      <Navbar header="PlayPal" />
      <h1 className="font-bold text-4xl mt-20">Finding a Match...</h1>
      <div className="mt-10">
        <img
          src="https://www.dummyimage.com/600x400/000/fff"
          alt="Picture of sport"
        ></img>
      </div>
      <div className="mt-20">
        <p>{matchSetting}</p>
      </div>
      <div className="items-center justify-center flex mt-40">
        <div className="rounded-xl w-36 h-20 bg-gray-200 flex items-center justify-center text-lg ">
          <ClickableIcons icon={"Cancel"} to={"/home"} />
        </div>
      </div>
    </>
  );
}
