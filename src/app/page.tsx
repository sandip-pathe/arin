import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Search,
  PlusCircle,
  Library,
  Wrench,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { UserProfile } from '@/components/user-profile';
import { ChatHistory } from '@/components/chat-history';
import { ChatInputArea } from '@/components/chat-input-area';
import { ChatWelcome } from '@/components/chat-welcome';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-4 p-2">
            <Button>
              <PlusCircle className="mr-2" />
              New Chat
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Library">
                  <Library />
                  <span>Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Tools">
                  <Wrench />
                  <span>Tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <Separator />
            <SidebarGroup>
              <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
              <ChatHistory />
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Separator className="my-2" />
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-10 md:hidden">
             <SidebarTrigger />
             <h1 className="text-lg font-headline font-semibold">Arin</h1>
          </header>
          <main className="flex-1 overflow-y-auto">
            <ChatWelcome />
          </main>
          <ChatInputArea />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
