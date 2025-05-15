import React from "react";
import Navbar from "../components/layout/navbar";
import BackButton from "../components/ui/backButton";

export default function createEvent() {
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
      <h2 className="font-bold mt-5">Event Details</h2>
      <form>
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] p-4">
          <input
            type="text"
            placeholder="Event Name"
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Event Description"
            className="border rounded p-2"
          />
          <input
            type="date"
            placeholder="Event Date"
            className="border rounded p-2"
          />
          <input
            type="time"
            placeholder="Event Time"
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Location"
            className="border rounded p-2"
          />
        </div>
        <button className="mt-10 border rounded-2xl p-2">Create Event</button>
      </form>
    </>
  );
}
