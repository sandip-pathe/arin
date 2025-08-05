"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SummarySettings } from "./summarySettings";
import { ChatSettings } from "./chatSettings";
import { AccountSettings } from "./accountSettings";
import { MembershipSettings } from "./membershipDetails";

export const UnifiedSettingsModal = ({
  isOpen,
  isOpenChange,
}: {
  isOpen: boolean;
  isOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={isOpenChange}>
      <DialogTitle className="sr-only">All Settings</DialogTitle>
      <DialogContent className="max-w-4xl p-0 h-[90dvh] bg-transparent shadow-none border-none overflow-hidden">
        <div className="relative bg-white rounded-3xl shadow-xl h-full p-4 flex flex-col">
          <Tabs defaultValue="summary" className="w-full flex-1 flex flex-col">
            {/* Tab Bar */}
            <TabsList className="mb-4 flex justify-center items-center gap-2 w-full overflow-x-auto">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
            </TabsList>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto pr-2">
              <TabsContent value="summary">
                <SummarySettings />
              </TabsContent>
              <TabsContent value="chat">
                <ChatSettings />
              </TabsContent>
              <TabsContent value="account">
                <AccountSettings />
              </TabsContent>
              <TabsContent value="membership">
                <MembershipSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
