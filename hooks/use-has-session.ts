"use client";

import { useMe } from "@/api/services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function hasSessionPayload(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;
    const o = data as { user?: { id?: string } };
    return Boolean(o.user?.id);
}


export function useHasSession() {
    const { data: me } = useMe()
    const router = useRouter()

    useEffect(() => {
        if (me && hasSessionPayload(me)) {
            router.push("/chat")
        }
    }, [me, router])

    return {
        hasSession: me && hasSessionPayload(me),
        user: me?.user
    }
}