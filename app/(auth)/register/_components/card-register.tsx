"use client"
import FormRegister from "./form-register"
import { useRegister } from "@/api/services/auth/auth.hooks"
import { LoginReq } from "@/api/services/auth/auth.types"
import { useState } from "react"

export function CardRegister() {
  const [captchaToken, setCaptchaToken] = useState<string>("")

  const {mutate, isPending, isSuccess} = useRegister()

  const onsubmit = (data : LoginReq) => {
    mutate({
      username: data.username,
      password: data.password,
      turnstileToken: captchaToken,
    })
  }

  return (
    <FormRegister
      onsubmit={onsubmit}
      isPending={isPending}
      isSuccess={isSuccess}
      setCaptchaToken={setCaptchaToken}
      captchaToken={captchaToken}
    />
  )
}
