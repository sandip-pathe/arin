"use client";
import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { MessageSquare, FileText } from "lucide-react";

const historyItems = [
  { id: "1", type: "chat", title: "Case Law Analysis" },
  { id: "2", type: "doc", title: "Contract Review NDA" },
  { id: "3", type: "chat", title: "US vs. EU Privacy Laws" },
  { id: "4", type: "chat", title: "Trademark Infringement" },
  { id: "5", type: "doc", title: "Merger Agreement Draft" },
];

export function ChatHistory() {
  const [activeItem, setActiveItem] = useState("1");

  return (
    <div className="flex flex-col h-full">
      {historyItems.map((item) => (
        <ul key={item.id} onClick={() => setActiveItem(item.id)}>
          <li className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {item.type === "chat" ? (
              <MessageSquare className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {item.title}
          </li>
        </ul>
      ))}
    </div>
  );
}
