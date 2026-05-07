"use client";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { useGetConversationsList } from "@/api/services/conversations";
import { ConversationListItem } from "@/api/services/conversations/conversations.types";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

function getWsUrl() {
  if (typeof window === "undefined") return "";
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  // Dev rule: if FE runs on :3000 (localhost/LAN IP), WS backend is :3001.
  if (window.location.port === "3000") {
    return `ws://${window.location.hostname}:3001/ws`;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

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
    Record<string, { last_message: string; last_message_at: string }>
  >({});
  const socketRef = useRef<WebSocket | null>(null);
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversations = useMemo(() => {
    const base = data?.conversations ?? [];
    const patched = base.map((c) => {
      const patch = livePatch[c.conversation_id];
      if (!patch) return c;
      return {
        ...c,
        last_message: patch.last_message,
        last_message_at: patch.last_message_at,
      };
    });
    return [...patched].sort((a, b) => {
      const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bt - at;
    });
  }, [data?.conversations, livePatch]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Stable ref to a joinAll function so onopen always reads the latest conversations.
  const joinAllRef = useRef<(() => void) | null>(null);
  joinAllRef.current = () => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    conversationsRef.current.forEach((c) => {
      ws.send(
        JSON.stringify({
          type: "join",
          conversationId: c.conversation_id,
        })
      );
    });
  };

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      const ws = new WebSocket(getWsUrl());
      socketRef.current = ws;

      ws.onopen = () => {
        // Join all currently-known conversations.
        // joinAllRef always reads the latest conversationsRef, avoiding race conditions
        // where data arrives after the socket was already open.
        joinAllRef.current?.();
      };

      ws.onmessage = (event) => {
        let parsed: {
          type: string;
          payload?: {
            conversation_id: string;
            message: string;
            created_at: string;
          };
        };
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return;
        }

        if (parsed.type !== "new_message" || !parsed.payload) return;
        const payload = parsed.payload;

        // Fast local patch for instant UI update.
        setLivePatch((prev) => ({
          ...prev,
          [payload.conversation_id]: {
            last_message: payload.message,
            last_message_at: payload.created_at,
          },
        }));

        // Always invalidate so the server is the source of truth for ordering/unread.
        // This is cheap because React Query deduplicates in-flight requests.
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      };

      ws.onclose = () => {
        socketRef.current = null;
        if (!isUnmounted) {
          reconnectTimerRef.current = setTimeout(connect, 1200);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [queryClient]);

  // When new conversations arrive (e.g. data loaded after WS already open),
  // join them so the sidebar receives broadcasts for those rooms too.
  useEffect(() => {
    joinAllRef.current?.();
  }, [conversations]);

  const selectConversation = (conversationId: string) => {
    router.push(`/chat?q=${conversationId}`);
    if (isMobile) setOpenSidebar(false);
  };

  const renderConversationItems = (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
      {conversations.map((conversation) => {
        const active = conversation.conversation_id === activeConversationId;
        return (
          <button
            key={conversation.conversation_id}
            type="button"
            onClick={() => selectConversation(conversation.conversation_id)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              active
                ? "border-primary bg-primary/10"
                : "border-border bg-background/40 hover:bg-background/70"
            }`}
          >
            <div className="text-sm font-semibold text-primary">{conversation.username}</div>
            <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {conversation.last_message ?? "Belum ada pesan"}
            </div>
          </button>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
        <SheetContent
          side="left"
          className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary"
          showCloseButton={false}
        >
          <div className="bg-primary/10 w-full flex gap-2 p-2">
            {/* <SearchIcon className="my-auto" /> */}
            <Input
              role="button"
              readOnly
              onClick={() => setOpen(true)}
              className="bg-secondary rounded-full cursor-pointer"
              placeholder="Cari..."
            />
          </div>
          {renderConversationItems}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary">
      <div className="bg-primary/10 w-full flex gap-2 p-2">
        {/* <SearchIcon className="my-auto" /> */}
        <Input
          role="button"
          readOnly
          onClick={() => setOpen(true)}
          className="bg-secondary rounded-full cursor-pointer"
          placeholder="Cari..."
        />
      </div>
      {renderConversationItems}
    </div>
  );
}
