"use client";
import { SearchIcon, SendIcon } from "lucide-react";
import CardChat from "./_components/card-chat";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dummyChat from "./_data/dummy-chat.json";
import { useState } from "react";
import Conversations from "./_components/conversation";
import { SearchDialog } from "@/components/search-dialog";
import { useGetConversation, useTargetUser } from "@/api/services/conversations";
import { useSearchParams } from "next/navigation";
import { SendMessageSchema, sendMessageSchema, useGetMessages, useSendMessage } from "@/api/services/messages";
import { useMe } from "@/api/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function ChatPage() {
  const [open, setOpen] = useState(false);
  const { mutate: targetUser } = useTargetUser();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("q");

  const {
    data: messages,
    isPending: isPendingMessages,
    isLoading: isLoadingMessages,
  } = useGetMessages(conversationId as string);

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

  const onSendMessage = (data : SendMessageSchema) => {
    if(conversationId){
      sendMessage({
        conversationId: conversationId as string,
        message: data.message,
      })
      resetField("message")
    }
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 w-full">
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
        {/* conversations content */}
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
