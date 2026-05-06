"use client";
import { useState, Suspense } from "react";
import Conversations from "./_components/conversation";
import { SearchDialog } from "@/components/search-dialog";
import { useGetConversation, useTargetUser } from "@/api/services/conversations";
import { useSearchParams } from "next/navigation";
import { SendMessageSchema, sendMessageSchema, useGetMessages, useSendMessage } from "@/api/services/messages";
import { useMe } from "@/api/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

function ChatContent() {
  const [open, setOpen] = useState(false);
  const { mutate: targetUser } = useTargetUser();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("q");
  const [openSidebar, setOpenSidebar] = useState(false);
  const { data: messages } = useGetMessages(conversationId as string);

  const onTargetUser = (id: string) => {
    targetUser(id);
    setOpen(false);
  };
  const { data: me } = useMe();
  const { data: conversation } = useGetConversation(conversationId as string);
  const { mutate: sendMessage, isPending: isPendingSendMessage } = useSendMessage();

  const { register, handleSubmit, resetField } = useForm<SendMessageSchema>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSendMessage = (data: SendMessageSchema) => {
    if (conversationId) {
      sendMessage({
        conversationId: conversationId as string,
        message: data.message,
      });
      resetField("message");
    }
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 w-full">
        <Sidebar setOpen={setOpen} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        {/* conversations content */}
        <Button onClick={() => setOpenSidebar(true)} variant="outline" size="icon" className="absolute top-1/6 left-4 rounded-full">
          <SearchIcon className="w-4 h-4"/>
        </Button>
        <Conversations
          onSendMessage={onSendMessage}
          messages={messages?.messages ?? []}
          me={me?.user ?? { id: "", username: "" }}
          sender={conversation ?? { conversationId: "", username: "" }}
          register={register}
          handleSubmit={handleSubmit}
          isLoading={isPendingSendMessage}
        />
      </div>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        onTargetUser={onTargetUser}
      />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
