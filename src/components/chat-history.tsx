'use client'
import { useState } from 'react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { MessageSquare, FileText } from 'lucide-react';

const historyItems = [
  { id: '1', type: 'chat', title: 'Case Law Analysis' },
  { id: '2', type: 'doc', title: 'Contract Review NDA' },
  { id: '3', type: 'chat', title: 'US vs. EU Privacy Laws' },
  { id: '4', type: 'chat', title: 'Trademark Infringement' },
  { id: '5', type: 'doc', title: 'Merger Agreement Draft' },
];

export function ChatHistory() {
  const [activeItem, setActiveItem] = useState('1');

  return (
    <SidebarMenu className="w-full">
      {historyItems.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            onClick={() => setActiveItem(item.id)}
            isActive={activeItem === item.id}
            className="w-full justify-start h-8"
            tooltip={{
              content: item.title,
              side: 'right',
              align: 'center',
            }}
          >
            {item.type === 'chat' ? <MessageSquare /> : <FileText />}
            <span className='truncate'>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
