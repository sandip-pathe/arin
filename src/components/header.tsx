import { Settings, MoreVertical } from "lucide-react";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-10">
      <h1 className="font-logo text-xl font-bold">NotebookLM</h1>
      <div className="flex gap-4 items-center">
        <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
        <div className="w-9 h-9 rounded-full bg-green-200 text-center flex items-center justify-center text-white font-bold cursor-pointer">
          S
        </div>
      </div>
    </header>
  );
}
