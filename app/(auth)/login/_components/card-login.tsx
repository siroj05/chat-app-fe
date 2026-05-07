"use client";

import { LoginReq, useLogin } from "@/api/services/auth";
import FormLogin from "./form.login";
import { useState } from "react";
import { toast } from "sonner";

export function CardLogin() {
  const [captchaToken, setCaptchaToken] = useState<string>("")
  const {mutate, isPending, isSuccess} = useLogin()

  const onsubmit = (data : LoginReq) => {
    console.log("captchaToken ==== ", captchaToken)
    if (!captchaToken) {
      toast.error("Silakan selesaikan captcha terlebih dahulu");
      return;
    }

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
