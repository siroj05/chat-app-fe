"use client"
import { useLogout, useMe } from "@/api/services/auth";
import { MessageSquareText } from "lucide-react";
import { DropdownAction } from "./dropdown-action";

export const Navbar = () => {
    const {mutate, isPending} = useLogout()
    const {data, isSuccess} = useMe()
    const onlogout = () => {
        mutate()
    }
  return (
    <div className="flex justify-between w-full shrink-0 bg-secondary text-secondary-foreground p-4 border-b">
      <h1 className="text-2xl font-bold flex gap-2">
        <MessageSquareText className="text-primary my-auto" />
        <p className="my-auto">
          JUJURLY
        </p>
      </h1>
      {isSuccess && <DropdownAction user={data?.user} onlogout={onlogout} isPending={isPending}/>}
    </div>
  );
};
