"use client"

import { useHasSession } from "@/hooks/use-has-session"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {

    useHasSession()

    return (
        <div className="h-screen w-full flex items-center justify-center">
            {children}
        </div>
    )
}