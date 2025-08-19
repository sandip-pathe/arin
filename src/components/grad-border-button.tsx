import React from "react";

export default function RainbowBorderButton() {
  return (
    <button className="relative p-[2px] rounded-full overflow-hidden">
      {/* Animated rainbow border */}
      <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,red,orange,yellow,green,blue,indigo,violet,red,black,black)] animate-rainbow"></span>

      {/* Button body */}
      <span className="relative block px-6 py-2 rounded-full bg-black text-white">
        Dive deeper in AI Mode
      </span>
    </button>
  );
}
