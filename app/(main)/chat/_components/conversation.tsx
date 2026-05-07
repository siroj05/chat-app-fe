import { GetConversationRes } from "@/api/services/conversations/conversations.types";
import { SendMessageSchema } from "@/api/services/messages";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, SendIcon } from "lucide-react";
import React, { useRef } from "react";
import { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { useEffect } from "react";
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
  sender: GetConversationRes;
  onSendMessage: (data: SendMessageSchema) => void;
  register: UseFormRegister<SendMessageSchema>;
  handleSubmit: UseFormHandleSubmit<SendMessageSchema>;
  isLoading: boolean;
}

export default function Conversations({
  messages,
  me,
  sender,
  onSendMessage,
  register,
  handleSubmit,
  isLoading,
}: ConversationsProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const didInitialScrollRef = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    // Saat pertama kali buka chat dengan riwayat pesan panjang, langsung lompat ke bawah.
    if (!didInitialScrollRef.current) {
      scrollToBottom("auto");
      didInitialScrollRef.current = true;
      return;
    }

    // Saat ada pesan baru, scroll halus ke bawah.
    scrollToBottom("smooth");
  }, [messages]);

  return (
    <div className="min-h-0 min-w-0 flex-1 flex flex-col justify-between">
      <div className="flex min-h-0 flex-1 flex-col">
        {sender.username && <div className="shrink-0 bg-secondary p-4 font-semibold border text-primary">
          {sender.username}
        </div>}
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
                <>
                  <div className="w-full flex justify-end">
                    <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary/80 p-2">
                      {m.message}
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}

          {isLoading && (
            <div className="w-full flex justify-end">
              <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary p-2">
                <Spinner className="w-4 h-4" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      
      {sender.conversationId ? <form
        onSubmit={handleSubmit(onSendMessage)}
        className="flex gap-2 p-2 bg-secondary"
      >
        <Textarea
          {...register("message")}
          id="message"
          placeholder="Tulis pesan..."
        />
        <Button
          size="lg"
          className="h-full w-[60px]"
          type="submit"
          disabled={isLoading}
        >
          {!isLoading ? (
            <SendIcon className="w-4 h-4" />
          ) : (
            <Spinner className="w-4 h-4" />
          )}
        </Button>
      </form> : 
      <>
        <div className="w-full flex justify-center items-center h-full text-primary">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xl max-sm:text-xs font-semibold">Pilih seorang pengguna untuk memulai obrolan</p>
            <MessageSquareText className="w-10 h-10 max-sm:w-5 max-sm:h-5" />
          </div>
        </div>
      </>
      }
    </div>
  );
}
