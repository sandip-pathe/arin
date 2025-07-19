import { FiSettings, FiShare2 } from "react-icons/fi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "./logo";

export default function TopNavbar() {
  return (
    <header className="h-16 my-auto px-4 flex items-center bg-[#edeffa] justify-between shadow-none select-none">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="text-sm font-medium font-logo text-primary mt-auto mb-1.5">
          Your Legal Assistant
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 text-md px-3 py-1 rounded-full bg-transparent hover:bg-gray-100 border text-foreground border-foreground/40">
          <FiShare2 size={18} />
          Share
        </button>

        {/* Settings */}
        <button className="flex items-center gap-1 text-md px-3 py-1 rounded-full bg-transparent hover:bg-gray-100 border text-foreground border-foreground/40">
          <FiSettings size={18} />
          Settings
        </button>

        {/* Dots */}
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <HiOutlineDotsVertical size={18} />
        </button>

        {/* Avatar */}
        <Avatar className="h-8 w-8 border-blue-600 border-2 shadow-sm">
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
