"use client"
import { useLogout, useMe } from "@/api/services/auth";
import { MessageSquareText } from "lucide-react";
import { DropdownAction } from "../dropdown-action";
import { isUserMgmtAdmin } from "@/lib/user-mgmt-admin";
import { useIndicator } from "./helper";
import { Button } from "../ui/button";
import Link from "next/link";

export const Navbar = () => {
  const { mutate, isPending } = useLogout()
  const { data, isSuccess } = useMe()
  const onlogout = () => {
    mutate()
  }
  const { indicator } = useIndicator();

  return (
    <div className="flex justify-between w-full shrink-0 bg-secondary text-secondary-foreground p-4 border-b">
      <h1 className="text-2xl font-bold flex gap-2">
        <MessageSquareText className="text-primary my-auto" />
        <Link href="/chat" className="my-auto text-primary">
          Jujurly
        </Link>
        <span className="text-xs text-slate-500">v1.4.0</span>
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
