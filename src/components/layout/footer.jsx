import React from "react";
import ClickableIcons from "../ui/clickableIcons";

export default function footer({ brandName = "brand name", externalLinks }) {
  const icons = [{ icon: "🏠" }, { icon: "🪙" }];
  return (
    <footer className="py-8 px-6 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-left">
          <h3 className="text-4xl">{brandName}</h3>
        </div>
        <div className="mb-8 text-left">
          <p>&copy; 2025 Your App. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-8">
          {icons.map((item, index) => (
            <div key={index} className="text-2xl cursor-pointer">
              <ClickableIcons icon={item.icon} />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
