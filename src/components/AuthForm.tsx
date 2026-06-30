import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  type LoginData,
  LoginInput,
  type RegisterData,
  RegisterInput,
  useLogin,
  useRegister,
} from "../actions/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { triggerBootSplash } from "./boot-splash";

export function AuthForm({ initialIsLogin = true }: { initialIsLogin?: boolean }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(isLogin ? LoginInput : RegisterInput),
  });

  const onSubmit = (data: LoginData | RegisterData) => {
    if (isLogin) {
      loginMutation.mutate(data as LoginData, { onSuccess: triggerBootSplash });
    } else {
      registerMutation.mutate(data as RegisterData, { onSuccess: triggerBootSplash });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    loginMutation.reset();
    registerMutation.reset();
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src="/skyshinelogonobgwhite.png"
          alt="Skyshine"
          className="h-10 w-auto object-contain"
        />
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Operations Center
        </p>
      </div>

      {/* Card */}
      <div className="rounded-[6px] border border-border bg-card shadow-2xl shadow-black/60 overflow-hidden">
        {/* Amber accent bar */}
        <div className="h-0.5 w-full bg-primary" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
              {isLogin ? "OPS CENTRE · AUTHENTICATION" : "OPS CENTRE · NEW OPERATOR"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="John Doe"
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message as string}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="name@company.com"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message as string}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+1 (555) 000-0000"
                  disabled={isPending}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message as string}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message as string}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <p className="text-center mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
        Skyshine · All Rights Reserved
      </p>
    </div>
  );
}
