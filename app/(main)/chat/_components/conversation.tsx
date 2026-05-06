import { useMe } from "@/api/services/auth";
import { GetConversationRes } from "@/api/services/conversations/conversations.types";
import { SendMessageSchema, sendMessageSchema } from "@/api/services/messages";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";
import React from "react";
import { UseFormHandleSubmit, UseFormRegister, useForm } from "react-hook-form";

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
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSendMessage)}
        className="flex gap-2 mb-5 px-2"
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
      </form>
    </div>
  );
}
