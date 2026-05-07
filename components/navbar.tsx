"use client"
import { useLogout, useMe } from "@/api/services/auth";
import { MessageSquareText } from "lucide-react";
import { DropdownAction } from "./dropdown-action";
import { useEffect, useMemo, useRef, useState } from "react";
import { isUserMgmtAdmin } from "@/lib/user-mgmt-admin";

const RECONNECT_MS = 1500;

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

function useWsStatusLight() {
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

export const Navbar = () => {
    const {mutate, isPending} = useLogout()
    const {data, isSuccess} = useMe()
    const wsStatus = useWsStatusLight();
    const onlogout = () => {
        mutate()
    }

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

  return (
    <div className="flex justify-between w-full shrink-0 bg-secondary text-secondary-foreground p-4 border-b">
      <h1 className="text-2xl font-bold flex gap-2">
        <MessageSquareText className="text-primary my-auto" />
        <p className="my-auto">
          JUJURLY
        </p>
        <span className="text-xs text-slate-500">v1.1.0</span>
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 p-1 text-xs">
          <span className={`h-4 w-4 rounded ${indicator.dot}`} />
          <span className={indicator.textColor}>{indicator.text}</span>
        </div>
        {isSuccess && data?.user && (
          <DropdownAction
            user={data.user}
            onlogout={onlogout}
            isPending={isPending}
            showUserMgmt={isUserMgmtAdmin(data.user.username)}
          />
        )}
      </div>
    </div>
  );
};
