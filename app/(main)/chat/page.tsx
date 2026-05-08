"use client";
import { useState, Suspense, useRef, useEffect } from "react";
import Conversations from "./_components/conversation";
import { SearchDialog } from "@/components/search-dialog";
import { useGetConversation, useTargetUser } from "@/api/services/conversations";
import { useSearchParams } from "next/navigation";
import {
  SendMessageSchema,
  sendMessageSchema,
  useChatWebSocket,
  useGetMessages,
  useSendMessage,
} from "@/api/services/messages";
import { useMe } from "@/api/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Sidebar from "@/components/sidebar/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

function ChatContent() {
  const [open, setOpen] = useState(false);
  const { mutate: targetUser } = useTargetUser();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("q");
  const [openSidebar, setOpenSidebar] = useState(false);
  const { data: messages } = useGetMessages(conversationId as string);
  const isMobile = useIsMobile()

  const { data: me } = useMe();
  const { data: conversation } = useGetConversation(conversationId as string);
  const { mutate: sendMessage, isPending: isPendingSendMessage } = useSendMessage();
  const { realtimeMessages, sendViaWs, isConnected } = useChatWebSocket(
    conversationId ?? undefined
  );

  const onTargetUser = (id: string) => {
    targetUser(id);
    setOpen(false);
  };

  const mergedMessages = (() => {
    const base = messages?.messages ?? [];
    if (realtimeMessages.length === 0) return base;
    const map = new Map(base.map((m) => [m.id, m]));
    for (const item of realtimeMessages) {
      map.set(item.id, item);
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  })();

  const { register, handleSubmit, resetField } = useForm<SendMessageSchema>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSendMessage = (data: SendMessageSchema) => {
    if (conversationId) {
      const sentViaWs = sendViaWs({
        conversationId: conversationId as string,
        message: data.message,
      });

      if (!sentViaWs) {
        // Fallback to existing HTTP flow when websocket is not ready.
        sendMessage({
          conversationId: conversationId as string,
          message: data.message,
        });
      }

      resetField("message");
      if (!isConnected) {
        toast.message("WebSocket belum terhubung, kirim via HTTP fallback");
      }
    }
  };

  const prevRealtimeCountRef = useRef(0)
  useEffect(() => {
    const newMessages = realtimeMessages.slice(prevRealtimeCountRef.current)
    prevRealtimeCountRef.current = realtimeMessages.length

    for (const m of newMessages) {
      if (m.sender_id !== me?.user?.id) {
        const preview = m.message.length > 50
          ? m.message.slice(0, 50) + "..."
          : m.message
        toast(preview, { position: "top-center" })
      }
    }
  }, [realtimeMessages, me?.user?.id])

  return (
    <>
      <div className="flex min-h-0 flex-1 w-full">
        <Sidebar setOpen={setOpen} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        {/* conversations content */}
        {isMobile && <Button onClick={() => setOpenSidebar(true)} variant="outline" size="icon" className="absolute top-1/6 left-4 rounded-full">
          <SearchIcon className="w-4 h-4" />
        </Button>}
        <Conversations
          onSendMessage={onSendMessage}
          messages={mergedMessages}
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

// suspense fix error
export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
