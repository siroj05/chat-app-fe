import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessagesApi, sendMessageApi } from "./messages.api";
import { toast } from "sonner";
import { SendMessageBody } from "./messages.types";

export const useGetMessages = (id: string) => {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessagesApi(id),
    enabled: !!id,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageApi,
    onSuccess: (_, variables) => {
      toast.success("Message sent successfully");
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

type RealtimeMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type WsServerEvent =
  | {
      type: "new_message";
      payload: RealtimeMessage;
      message: string;
    }
  | {
      type: "error";
      message: string;
      payload: RealtimeMessage;
    };

function getWsUrl() {
  if (typeof window === "undefined") return "";
  // Allow explicit override per environment (recommended for production).
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;

  // Dev rule: if FE runs on :3000 (localhost/LAN IP), WS backend is :3001.
  if (window.location.port === "3000") {
    return `ws://${window.location.hostname}:3001/ws`;
  }

  // Default same-origin deployment.
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export const useChatWebSocket = (conversationId?: string) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConversationIdRef = useRef<string | undefined>(conversationId);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, RealtimeMessage[]>
  >({});

  useEffect(() => {
    activeConversationIdRef.current = conversationId;
    const socket = socketRef.current;
    if (!conversationId || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "join",
        conversationId,
      }),
    );
  }, [conversationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isUnmounted = false;

    const connect = () => {
      const socket = new WebSocket(getWsUrl());
      socketRef.current = socket;
      setReadyState(WebSocket.CONNECTING);

      socket.onopen = () => {
        setReadyState(WebSocket.OPEN);
        const activeConversationId = activeConversationIdRef.current;
        if (activeConversationId) {
          socket.send(
            JSON.stringify({
              type: "join",
              conversationId: activeConversationId,
            }),
          );
        }
      };

      socket.onmessage = (event) => {
        let data: WsServerEvent;
        try {
          data = JSON.parse(event.data) as WsServerEvent;
        } catch {
          return;
        }

        if (data.type === "error") {
          toast.error(data.message);
          return;
        }

        if (data.type === "new_message") {
          const targetConversationId = data.payload.conversation_id;
          if (!targetConversationId) return;
          setMessagesByConversation((prev) => {
            const existing = prev[targetConversationId] ?? [];

            if (existing.find((m) => m.id === data.payload.id)) {
              return prev;
            }

            return {
              ...prev,
              [targetConversationId]: [...existing, data.payload],
            };
          });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      };

      socket.onerror = () => {
        setReadyState(WebSocket.CLOSED);
      };

      socket.onclose = () => {
        setReadyState(WebSocket.CLOSED);
        socketRef.current = null;
        // Best-effort reconnect while current conversation is still active.
        if (!isUnmounted) {
          reconnectTimerRef.current = setTimeout(connect, 1200);
        }
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
      setReadyState(WebSocket.CLOSED);
    };
  }, [queryClient]);

  const sendViaWs = (body: SendMessageBody) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(
      JSON.stringify({
        type: "send_message",
        conversationId: body.conversationId,
        message: body.message,
      }),
    );
    return true;
  };

  const realtimeMessages = useMemo(() => {
    if (!conversationId) return [];
    return messagesByConversation[conversationId] ?? [];
  }, [conversationId, messagesByConversation]);

  return {
    realtimeMessages,
    sendViaWs,
    isConnected: readyState === WebSocket.OPEN,
  };
};
