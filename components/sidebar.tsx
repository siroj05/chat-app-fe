"use client";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent } from "./ui/sheet";

export default function Sidebar({
  setOpen,
  openSidebar,
  setOpenSidebar,
}: {
  setOpen: (open: boolean) => void;
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();


  if (isMobile) {
    return (
      <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
        <SheetContent
          side="left"
          className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary"
          showCloseButton={false}
        >
          <div className="bg-primary/10 w-full flex gap-2 p-2">
            <SearchIcon className="my-auto" />
            <Input
              role="button"
              readOnly
              onClick={() => setOpen(true)}
              className="bg-secondary rounded-full cursor-pointer"
              placeholder="Cari..."
            />
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {/* ini card  */}
            {/* {conversations.map(
                        (conversation, index) => (
                            <CardChat key={index} conversation={conversation} selectConversation={(conversation) => setConversationId({id : conversation.id, name : conversation.name})}/>
                        ),
                        )} */}
            {/* ini card  */}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary">
      <div className="bg-primary/10 w-full flex gap-2 p-2">
        <SearchIcon className="my-auto" />
        <Input
          role="button"
          readOnly
          onClick={() => setOpen(true)}
          className="bg-secondary rounded-full cursor-pointer"
          placeholder="Cari..."
        />
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
        {/* ini card  */}
        {/* {conversations.map(
              (conversation, index) => (
                <CardChat key={index} conversation={conversation} selectConversation={(conversation) => setConversationId({id : conversation.id, name : conversation.name})}/>
              ),
            )} */}
        {/* ini card  */}
      </div>
    </div>
  );
}
