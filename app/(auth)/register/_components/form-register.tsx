import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginReq, loginSchema } from "@/api/services/auth";
import Turnstile from "react-turnstile";

interface FormRegisterProps {
  onsubmit : (data : LoginReq) => void;
  isPending : boolean;
  isSuccess : boolean;
  setCaptchaToken : (token : string) => void;
  captchaToken : string;
}

export default function FormRegister(
    {onsubmit, isPending, setCaptchaToken, captchaToken} : FormRegisterProps
) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginReq>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      turnstileToken: "",
    },
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Register to your account</CardTitle>
        <CardDescription>
          Enter your username and password below to register to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit(onsubmit)} className="space-y-6">
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                {...register("username")}
                id="username"
                type="username"
                placeholder="Username"
                required
              />
              {errors.username && <p className="text-red-500">{errors.username.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" {...register("password")} required />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                onVerify={(token) => {
                  setCaptchaToken(token);
                }}
                onExpire={() => {
                  setCaptchaToken("");
                }}
                onError={() => {
                  setCaptchaToken("");
                }}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isPending || !captchaToken}>
            {isPending ? "Registering..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
