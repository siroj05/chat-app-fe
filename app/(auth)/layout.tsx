"use client"

import { useHasSession } from "@/hooks/use-has-session"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {

    const { hasSession } = useHasSession()
    const router = useRouter()
    useEffect(() => {
        if (hasSession) {
            const interval = setInterval(() => {
                router.push(`/chat`);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [hasSession, router]);

    return (
        <div className="h-screen w-full flex items-center justify-center">
            {children}
        </div>
    )
}