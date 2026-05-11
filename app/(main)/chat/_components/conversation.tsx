import { GetConversationRes } from "@/api/services/conversations/conversations.types";
import { SendMessageSchema } from "@/api/services/messages";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, SendIcon, Loader2 } from "lucide-react";
import React, { useMemo, useRef } from "react";
import { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

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
  hasOlderMessages: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
}

export default function Conversations({
  messages,
  me,
  sender,
  onSendMessage,
  register,
  handleSubmit,
  isLoading,
  hasOlderMessages,
  isLoadingOlder,
  onLoadOlder,
}: ConversationsProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // column-reverse needs messages in reverse chronological order (newest first)
  // so that the first DOM child (newest) appears at the visual bottom.
  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  return (
    <div className="min-h-0 min-w-0 flex-1 flex flex-col justify-between">
      <div className="flex min-h-0 flex-1 flex-col">
        {sender.username && (
          <div className="shrink-0 bg-secondary p-4 font-semibold border text-primary">
            <div className="flex gap-2 w-full">
              <div className="bg-primary w-10 h-10 rounded-full flex justify-center items-center text-white">
                <p>{sender.username.split('')[0].toUpperCase()}</p>
              </div>
              <p className="my-auto">
                {sender.username}
              </p>
            </div>
          </div>
        )}
        {/*
          flex-direction: column-reverse makes the scroll container start
          from the bottom by default — no JS scroll hacks, no flash.
          First DOM child = visual bottom, last DOM child = visual top.
        */}
        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto p-4 text-white flex flex-col-reverse gap-2"
        >
          {/* ── Visual bottom zone (first in DOM = bottom in column-reverse) ── */}
          {isLoading && (
            <div className="w-full flex justify-end">
              <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary p-2">
                <Spinner className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* ── Messages (newest first in DOM = bottom visually) ── */}
          {reversed?.map((m) => (
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
                  <div className="w-fit max-w-[min(100%,28rem)] wrap-break-word rounded-lg border bg-primary/80 p-2">
                    {m.message}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* ── Visual top zone (last in DOM = top in column-reverse) ── */}
          {/* Load More button — user clicks to fetch older messages */}
          {hasOlderMessages && (
            <div className="flex justify-center py-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadOlder}
                disabled={isLoadingOlder}
                className="text-muted-foreground hover:text-primary"
              >
                {isLoadingOlder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memuat...
                  </>
                ) : (
                  "Muat pesan lama..."
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {sender.conversationId ? (
        <form
          onSubmit={handleSubmit(onSendMessage)}
          className="flex gap-2 p-2 bg-secondary"
        >
          <Textarea
            {...register("message")}
            id="message"
            placeholder="Tulis pesan..."
            onKeyDown={(e) => {
              if (e.key == "Enter" && !e.shiftKey) {
                e.preventDefault();

                if (!e.currentTarget.value.trim()) return;

                handleSubmit(onSendMessage)();
              }
            }}
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
        </form>
      ) : (
        <>
          <div className="w-full flex justify-center items-center h-full text-primary">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl max-sm:text-xs font-semibold">
                Pilih seorang pengguna untuk memulai obrolan
              </p>
              <MessageSquareText className="w-10 h-10 max-sm:w-5 max-sm:h-5" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
