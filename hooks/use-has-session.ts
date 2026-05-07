import { useMe } from "@/api/services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function hasSessionPayload(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;
    const o = data as { success?: boolean; data?: { user?: { id?: string } } };
    return o.success === true && Boolean(o.data?.user?.id);
}


export function useHasSession() {
    const {data: me, isSuccess} = useMe()
    const router = useRouter()

    useEffect(() => {
        if (me && hasSessionPayload(me)) {
            router.push("/chat")
        }
    },[me, isSuccess, router])

    return {
        hasSession: me && hasSessionPayload(me)
    }
}