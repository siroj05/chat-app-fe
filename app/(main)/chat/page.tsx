"use client";
import { SearchIcon, SendIcon } from "lucide-react";
import CardChat from "./_components/card-chat";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dummyChat from "./_data/dummy-chat.json";
import { useState } from "react";
import Conversations from "./_components/conversation";

export default function ChatPage() {
    const { conversations } = dummyChat;
    const {messagesByConversationId} = dummyChat;
    const [conversationId, setConversationId] = useState<{id : string, name : string} | null>(null);
    const messages = messagesByConversationId[conversationId?.id as keyof typeof messagesByConversationId];

  return (
    <div className="flex min-h-0 flex-1 w-full">
      <div className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary">
        <div className="bg-primary/10 w-full flex gap-2 p-2">
            <SearchIcon className="my-auto"/>
            <Input className="bg-secondary rounded-full" placeholder="Cari..."/>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
          {/* ini card  */}
          {conversations.map(
            (conversation, index) => (
              <CardChat key={index} conversation={conversation} selectConversation={(conversation) => setConversationId({id : conversation.id, name : conversation.name})}/>
            ),
          )}
          {/* ini card  */}
        </div>
      </div>
      {/* conversations content */}
      {
        messages &&
        <Conversations messages={messages} conversationName={conversationId?.name as string} />
      }
    </div>
  );
}
