import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import React from "react";

interface ConversationsProps {
  messages: {
    id: string;
    from: string;
    body: string;
    time: string;
  }[];
  conversationName: string;
}

export default function Conversations({ messages, conversationName }: ConversationsProps) {
  return (
    <div className="min-h-0 min-w-0 flex-1 flex flex-col justify-between">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 bg-secondary p-4 font-semibold border">
          {conversationName}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-white space-y-2">
            {
                messages?.map((m) => (
                    <React.Fragment key={m.id}>
                        {/* menerima pesan */}
                        {
                            m.from === "them" &&    
                                <div className="w-full">
                                    <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary p-2">
                                    {m.body}
                                    </div>
                                </div>
                        }

                        {/* mengirim pesan */}
                        {
                            m.from === "me" &&
                                <div className="w-full flex justify-end">
                                    <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary p-2">
                                    {m.body}
                                    </div>
                                </div>
                        }
                    </React.Fragment>
                ))
            }
        </div>
      </div>
      <div className="flex gap-2 mb-5 px-2">
        <Textarea />
        <Button size="lg" className="h-full w-[60px]">
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
