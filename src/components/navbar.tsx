import Logo from "./logo";
import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function TopNavbar({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) {
  return (
    <header className="h-12 my-auto px-4 hidden lg:flex items-center bg-[#edeffa] justify-between shadow-none select-none">
      <div className="flex items-center gap-2">
        <Logo />
        <span
          className={`text-sm font-medium font-[Inter] text-primary mt-auto mb-1.5 transition-all duration-300 ease-in-out ${
            isSidebarOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 pointer-events-none"
          }`}
        >
          Your Legal Assistant
        </span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Private Session
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Files processed locally</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Auto-deleted after session</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Zero data retention</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
}
