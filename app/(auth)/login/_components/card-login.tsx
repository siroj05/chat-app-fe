"use client";

import { LoginReq, useLogin } from "@/api/services/auth";
import FormLogin from "./form.login";
import { useState } from "react";

export function CardLogin() {
  const [captchaToken, setCaptchaToken] = useState<string>("")
  const {mutate, isPending, isSuccess} = useLogin()

  const onsubmit = (data : LoginReq) => {
    mutate(
      {
        username: data.username,
        password: data.password,
        turnstileToken: captchaToken,
      } as LoginReq
    )
  }

  return <FormLogin onsubmit={onsubmit} isPending={isPending} isSuccess={isSuccess} setCaptchaToken={setCaptchaToken} captchaToken={captchaToken}/>
}
