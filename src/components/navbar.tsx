import Logo from "./logo";

export default function TopNavbar({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) {
  return (
    <header className="h-12 my-auto px-4 hidden lg:block items-center bg-[#edeffa] justify-between shadow-none select-none">
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
    </header>
  );
}
