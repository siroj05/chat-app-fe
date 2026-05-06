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
    }
  | {
      type: "error";
      message: string;
    };

function getWsUrl() {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export const useChatWebSocket = (conversationId?: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, RealtimeMessage[]>
  >({});

  useEffect(() => {
    if (!conversationId) return;

    const socket = new WebSocket(getWsUrl());
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "join",
          conversationId,
        }),
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

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

    return () => {
      socket.close();
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
