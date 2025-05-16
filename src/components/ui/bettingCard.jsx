import React from "react";

export default function BettingCard({
  setting = "dateAndTimeAndLocation",
  team1 = "team1",
  team2 = "team2",
  odds1 = "odds1",
  odds2 = "odds2",
  odds3 = "odds3",
}) {
  return (
    <div className="border p-4 rounded-md max-w-md">
      <div className="mb-3">
        <div className="text-left">{setting}</div>
      </div>
      <div className="mb-4">
        <div className="text-xl font-bold">{team1}</div>
        <div className="text-xl font-bold">vs</div>

        <div className="text-xl font-bold">{team2}</div>
      </div>
      <div className="flex gap-2">
        <div className="rounded p-3 flex-1 text-center">
          <div className="mb-1">{team1}</div>
          <div>{odds1}</div>
        </div>
        <div className="rounded p-3 flex-1 text-center">
          <div className="mb-1">Draw</div>
          <div>{odds2}</div>
        </div>
        <div className="rounded p-3 flex-1 text-center">
          <div className="mb-1">{team2}</div>
          <div >{odds3}</div>
        </div>
      </div>
    </div>
  );
}
