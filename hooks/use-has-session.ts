"use client";

import { useMe } from "@/api/services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Bentuk sama dengan response `GET /api/auth/me` dan login (`{ user: … }`). */
export function hasSessionPayload(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;
    const o = data as { user?: { id?: string } };
    return Boolean(o.user?.id);
}


export function useHasSession() {
    const { data: me, isSuccess } = useMe()
    const router = useRouter()
    console.log("me = ", me)


    useEffect(() => {
        console.log("isSuccess = ", isSuccess)
        if (isSuccess) {
            console.log("masuk ke is success")
            router.push("/login")
        }
    }, [isSuccess])

    // useEffect(() => {
    //     if (me && hasSessionPayload(me)) {
    //         console.log("kesini juga masuk")
    //         router.push("/chat")
    //     }
    // }, [me, isSuccess, router])

    return {
        hasSession: me && hasSessionPayload(me),
        user: me?.user
    }
}