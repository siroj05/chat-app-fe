"use client";

import { LoginReq, useLogin } from "@/api/services/auth";
import FormLogin from "./form.login";

export function CardLogin() {
  
  const {mutate, isPending, isSuccess} = useLogin()

  const onsubmit = (data : LoginReq) => {
    mutate(data)
  }

  return <FormLogin onsubmit={onsubmit} isPending={isPending} isSuccess={isSuccess}/>
}
