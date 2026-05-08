import { ConversationListItem, GetConversationsListRes } from "@/api/services/conversations/conversations.types";
import { getWsUrl } from "@/lib/ws-url";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, RefObject, SetStateAction, useEffect, useMemo, useRef } from "react";

export const useConverSations = (
    data: GetConversationsListRes | undefined,
    livePatch: Record<string, { last_message: string; last_message_at: string; username?: string }>,
) => {
    const conversations: ConversationListItem[] = useMemo(() => {
        const base = data?.conversations ?? [];
        const knownIds = new Set(base.map((c) => c.conversation_id));
        const patched = base.map((c) => {
            const patch = livePatch[c.conversation_id];
            if (!patch) return c;
            return {
                ...c,
                last_message: patch.last_message,
                last_message_at: patch.last_message_at,
            };
        });

        // Add temporary entries for conversations that arrived via WS but
        // haven't been fetched by the query yet (e.g. brand-new conversations).
        const newEntries: ConversationListItem[] = [];
        for (const [convId, patch] of Object.entries(livePatch)) {
            if (!knownIds.has(convId)) {
                newEntries.push({
                    conversation_id: convId,
                    username: patch.username ?? "...",
                    last_message: patch.last_message,
                    last_message_at: patch.last_message_at,
                });
            }
        }

        return [...patched, ...newEntries].sort((a, b) => {
            const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return bt - at;
        });
    }, [data?.conversations, livePatch]);

    return {
        conversations
    }
}

export const useJoinAllRef = (
    socketRef: RefObject<WebSocket | null>,
    conversationsRef: RefObject<ConversationListItem[]>
) => {
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

    return {
        joinAllRef
    }
}


export const useConversationWebSocket = (
    socketRef: RefObject<WebSocket | null>,
    joinAllRef: RefObject<(() => void) | null>,
    setLivePatch: Dispatch<
        SetStateAction<
            Record<
                string,
                {
                    last_message: string;
                    last_message_at: string;
                    username?: string;
                }
            >
        >
    >
) => {
    const queryClient = useQueryClient();
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let isUnmounted = false;

        const connect = () => {
            const ws = new WebSocket(getWsUrl());

            socketRef.current = ws;

            ws.onopen = () => {
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

                setLivePatch((prev) => ({
                    ...prev,
                    [payload.conversation_id]: {
                        last_message: payload.message,
                        last_message_at: payload.created_at,
                    },
                }));

                queryClient.invalidateQueries({
                    queryKey: ["conversations"],
                });
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
            }

            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [queryClient, socketRef, joinAllRef, setLivePatch]);
};