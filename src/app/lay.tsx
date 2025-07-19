"use client";

import { useState } from "react";
import {
  BsLayoutSidebarInsetReverse,
  BsLayoutSidebarInset,
} from "react-icons/bs";

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
  );
}

export default function MainPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isStudioOpen, setStudioOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-muted text-foreground">
      {/* Top Navigation Placeholder */}
      <header className="h-12 px-4 flex items-center justify-between border-b bg-background shadow-sm">
        <div className="font-semibold">Your App</div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen ? (
          <aside className="w-64 border-none bg-white rounded-lg m-4 flex flex-col transition-all duration-300">
            <div className="z-10 border-b flex items-center justify-between">
              <div className="p-4 font-medium">Sidebar</div>
              <BsLayoutSidebarInset
                className="cursor-pointer m-2"
                size={24}
                onClick={() => setSidebarOpen((prev) => !prev)}
              />
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {/* Skeleton Content */}
              <SkeletonBox className="h-4 w-2/3" />
              <SkeletonBox className="h-4 w-1/2" />
              <SkeletonBox className="h-4 w-5/6" />
              <SkeletonBox className="h-32 w-full mt-4" />
            </div>
          </aside>
        ) : (
          <aside className="w-12 border-none bg-white rounded-lg m-4 flex flex-col transition-all duration-300">
            <div className="z-10 border-b flex items-center justify-center">
              <BsLayoutSidebarInset
                className="cursor-pointer m-2"
                size={24}
                onClick={() => setSidebarOpen((prev) => !prev)}
              />
            </div>
            <div className="flex-1 overflow-auto p-4"> </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 overflow-auto p-4 ${
            isSidebarOpen
              ? isStudioOpen
                ? "mx-0"
                : "mr-0"
              : isStudioOpen
              ? "ml-0"
              : ""
          }`}
        >
          <div className="h-full border-none rounded-xl bg-white flex flex-col p-6 space-y-4">
            {/* Skeleton Main Header */}
            <SkeletonBox className="h-6 w-1/4" />
            {/* Skeleton Cards or Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 p-4 rounded-lg space-y-2 animate-pulse"
                >
                  <SkeletonBox className="h-4 w-2/3" />
                  <SkeletonBox className="h-4 w-1/2" />
                  <SkeletonBox className="h-20 w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Studio Panel */}
        {isStudioOpen ? (
          <aside className="w-80 border-none bg-white rounded-lg m-4 flex flex-col transition-all duration-300">
            <div className="z-10 border-b flex items-center justify-between">
              <BsLayoutSidebarInsetReverse
                className="cursor-pointer m-2"
                size={24}
                onClick={() => setStudioOpen((prev) => !prev)}
              />
              <div className="p-4 font-medium">Studio</div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {/* Skeleton Sidebar Content */}
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-4 w-1/2" />
              <SkeletonBox className="h-32 w-full mt-4" />
              <SkeletonBox className="h-8 w-full mt-4" />
            </div>
          </aside>
        ) : (
          <aside className="w-12 border-none bg-white rounded-lg m-4 flex flex-col transition-all duration-300">
            <div className="z-10 border-b flex items-center justify-center">
              <BsLayoutSidebarInset
                className="cursor-pointer m-2"
                size={24}
                onClick={() => setStudioOpen((prev) => !prev)}
              />
            </div>
            <div className="flex-1 overflow-auto p-4"> </div>
          </aside>
        )}
      </div>
    </div>
  );
}
