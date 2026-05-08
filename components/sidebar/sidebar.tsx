"use client";
import { Input } from "../ui/input";
import { RefreshCwIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef, useState } from "react";
import { useGetConversationsList } from "@/api/services/conversations";
import { ConversationListItem } from "@/api/services/conversations/conversations.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useConverSations, useConversationWebSocket, useJoinAllRef } from "./handlers";
import SidebarMobile from "./sidebar-mobile";
import RenderConversations from "./render-conversations";

export default function Sidebar({
  setOpen,
  openSidebar,
  setOpenSidebar,
}: {
  setOpen: (open: boolean) => void;
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("q");
  const { data } = useGetConversationsList();
  const [livePatch, setLivePatch] = useState<
    Record<string, { last_message: string; last_message_at: string; username?: string }>
  >({});
  const socketRef = useRef<WebSocket | null>(null);
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const { conversations } = useConverSations(data, livePatch)
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  const { joinAllRef } = useJoinAllRef(socketRef, conversationsRef)
  useConversationWebSocket(
    socketRef,
    joinAllRef,
    setLivePatch
  );
  // When new conversations arrive (e.g. data loaded after WS already open),
  // join them so the sidebar receives broadcasts for those rooms too.
  useEffect(() => {
    joinAllRef.current?.();
  }, [conversations]);

  const selectConversation = (conversationId: string) => {
    router.push(`/chat?q=${conversationId}`);
    if (isMobile) setOpenSidebar(false);
  };

  if (isMobile) {
    return (
      <SidebarMobile
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        setOpen={setOpen}
        renderConversationItems={
          <RenderConversations
            conversations={conversations}
            selectConversation={selectConversation}
            activeConversationId={activeConversationId}
          />
        }
      />
    );
  }
  // sidebar dekstop view
  return (
    <div className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary">
      <div className="bg-primary/10 w-full flex gap-2 p-2">
        <Input
          role="button"
          readOnly
          onClick={() => setOpen(true)}
          className="bg-secondary rounded-full cursor-pointer"
          placeholder="Cari..."
        />
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
          size="icon"
          className="rounded-full">
          <RefreshCwIcon className="my-auto" />
        </Button>
      </div>
      <RenderConversations
        conversations={conversations}
        selectConversation={selectConversation}
        activeConversationId={activeConversationId}
      />
    </div>
  );
}
