"use client"
import FormRegister from "./form-register"
import { useRegister } from "@/api/services/auth/auth.hooks"
import { LoginReq } from "@/api/services/auth/auth.types"

export function CardRegister() {

  const {mutate, isPending, isSuccess} = useRegister()

  const onsubmit = (data : LoginReq) => {
    mutate(data)
  }

  return <FormRegister onsubmit={onsubmit} isPending={isPending} isSuccess={isSuccess}/>
}
