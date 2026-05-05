import { useMe } from "@/api/services/auth";
import { GetConversationRes } from "@/api/services/conversations/conversations.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import React from "react";

interface ConversationsProps {
  messages: {
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
  }[];
  me: {
    id: string;
    username: string;
  };
  sender: GetConversationRes
}

export default function Conversations({ messages, me, sender }: ConversationsProps) {
  
  return (
    <div className="min-h-0 min-w-0 flex-1 flex flex-col justify-between">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 bg-secondary p-4 font-semibold border">
          {sender.username}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-white space-y-2">
          {messages?.map((m) => (
            <React.Fragment key={m.id}>
              {/* menerima pesan */}
              {m.sender_id !== me.id && (
                <div className="w-full">
                  <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary p-2">
                    {m.message}
                  </div>
                </div>
              )}

              {/* mengirim pesan */}
              {m.sender_id === me.id && (
                <div className="w-full flex justify-end">
                  <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary p-2">
                    {m.message}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <form className="flex gap-2 mb-5 px-2">
        <Textarea />
        <Button size="lg" className="h-full w-[60px]">
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
