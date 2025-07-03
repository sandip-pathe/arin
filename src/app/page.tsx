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
  Wrench,
  MoreVertical,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatHistory } from '@/components/chat-history';
import { ChatInputArea } from '@/components/chat-input-area';
import { ChatWelcome } from '@/components/chat-welcome';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r">
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        
        <SidebarContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col">
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 border-none justify-start"
            >
              New Chat
              <PlusCircle className="mr-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent hover:text-black hover:bg-gray-200 dark:hover:bg-gray-800 border-none justify-start"
            >
              Tools library
            </Button>
          </div>
          
          <div className="relative justify-start">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search chats..." 
              className="pl-10 bg-gray-100 border-none focus-visible:ring-0" 
            />
          </div>
          
          <SidebarGroup className='p-0'>
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Recent Chats
            </SidebarGroupLabel>
            <ChatHistory />
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/user-avatar.jpg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-10 md:hidden">
            <SidebarTrigger className="text-gray-700 dark:text-gray-300" />
            <h1 className="text-lg font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Arin
            </h1>
          </header>
          <main className="overflow-y-auto flex-1">
            <ChatWelcome />
          </main>
          <ChatInputArea />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}