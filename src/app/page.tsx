'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
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
} from '@/components/ui/sidebar';
import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatHistory } from '@/components/chat-history';
import { ChatInputArea } from '@/components/chat-input-area';
import { ChatWelcome } from '@/components/chat-welcome';
import Logo from '@/components/logo';
import Footer from '@/components/footer';
import { UserProfile } from '@/components/user-profile';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <Skeleton className="h-8 w-48 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r">
        <SidebarHeader className="p-6">
          <Logo />
        </SidebarHeader>

        <SidebarContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col">
            <Button
              variant="outline"
              className="flex-1 bg-transparent hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 border-none justify-start"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Chat
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

          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Recent Chats
            </SidebarGroupLabel>
            <ChatHistory />
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <UserProfile />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex h-svh flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-10 md:hidden">
            <SidebarTrigger className="text-gray-700 dark:text-gray-300" />
            <Logo />
          </header>
          <main className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <ChatWelcome />
            </div>
            <div className="p-4 md:p-6 pt-0">
               <div className="w-full max-w-4xl mx-auto">
                <ChatInputArea />
                <Footer />
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
