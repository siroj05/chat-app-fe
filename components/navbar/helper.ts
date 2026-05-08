import { getWsUrl } from "@/lib/ws-url";
import { useEffect, useMemo, useRef, useState } from "react";

const RECONNECT_MS = 1500;

export function useWsStatusLight() {
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "error">(
        "connecting"
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        let isUnmounted = false;

        const connect = () => {
            setStatus("connecting");
            const socket = new WebSocket(getWsUrl());
            socketRef.current = socket;

            socket.onopen = () => setStatus("connected");
            socket.onerror = () => setStatus("error");
            socket.onclose = () => {
                setStatus("error");
                socketRef.current = null;
                if (!isUnmounted) {
                    reconnectTimerRef.current = setTimeout(connect, RECONNECT_MS);
                }
            };
        };

        connect();
        return () => {
            isUnmounted = true;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, []);

    return status;
}

export const useIndicator = () => {
    const wsStatus = useWsStatusLight();
    const indicator = useMemo(() => {
        if (wsStatus === "connected") {
            return {
                dot: "bg-emerald-500",
                text: "Connected",
                textColor: "text-emerald-500",
            };
        }
        if (wsStatus === "connecting") {
            return {
                dot: "bg-amber-400 animate-pulse",
                text: "Connecting",
                textColor: "text-amber-400",
            };
        }
        return {
            dot: "bg-red-500",
            text: "WS Error",
            textColor: "text-red-500",
        };
    }, [wsStatus]);

    return {
        indicator
    }
}
