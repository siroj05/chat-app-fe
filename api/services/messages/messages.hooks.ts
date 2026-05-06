import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: sendMessageApi,
    onSuccess: () => {
      toast.success("Message sent successfully");
    //   queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

type RealtimeMessage = {
  id: string;
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

  // Local dev: FE usually runs on :3000 and BE on :3001.
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return `ws://${window.location.hostname}:3001/ws`;
  }

  // Default same-origin deployment.
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export const useChatWebSocket = (conversationId?: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, RealtimeMessage[]>
  >({});

  useEffect(() => {
    if (!conversationId) return;

    let isUnmounted = false;

    const connect = () => {
      const socket = new WebSocket(getWsUrl());
      socketRef.current = socket;
      setReadyState(WebSocket.CONNECTING);

      socket.onopen = () => {
        setReadyState(WebSocket.OPEN);
        socket.send(
          JSON.stringify({
            type: "join",
            conversationId,
          }),
        );
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
          setMessagesByConversation((prev) => {
            const existing = prev[conversationId] ?? [];

            if (existing.find((m) => m.id === data.payload.id)) {
              return prev;
            }

            return {
              ...prev,
              [conversationId]: [...existing, data.payload],
            };
          });
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
  }, [conversationId]);

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
