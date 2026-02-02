import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type LoginData,
  LoginInput,
  type RegisterData,
  RegisterInput,
  useLogin,
  useRegister,
} from "../actions/auth";

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
      loginMutation.mutate(data as LoginData);
    } else {
      registerMutation.mutate(data as RegisterData);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    loginMutation.reset();
    registerMutation.reset();
  };

  return (
    <div className="max-w-[420px] mx-auto p-10 rounded-xl shadow-2xl bg-white border border-gray-100 mt-8">
      <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">
        {isLogin ? "Sign In" : "Create Account"}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Full Name</label>
            <input
              {...register("name")}
              placeholder="e.g. John Doe"
              className="p-3 rounded-md border border-gray-300 text-base outline-none focus:border-blue-500 transition-colors"
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message as string}</span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Email Address</label>
          <input
            {...register("email")}
            type="email"
            placeholder="name@company.com"
            className="p-3 rounded-md border border-gray-300 text-base outline-none focus:border-blue-500 transition-colors"
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-1">{errors.email.message as string}</span>
          )}
        </div>

        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Phone Number</label>
            <input
              {...register("phone")}
              placeholder="+1 (555) 000-0000"
              className="p-3 rounded-md border border-gray-300 text-base outline-none focus:border-blue-500 transition-colors"
            />
            {errors.phone && (
              <span className="text-red-500 text-xs mt-1">{errors.phone.message as string}</span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Password</label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="p-3 rounded-md border border-gray-300 text-base outline-none focus:border-blue-500 transition-colors"
          />
          {errors.password && (
            <span className="text-red-500 text-xs mt-1">{errors.password.message as string}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 p-3 rounded-md bg-black text-white text-lg font-bold cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-70"
        >
          {isPending ? "Please wait..." : isLogin ? "Sign In" : "Register"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="bg-none border-none text-blue-600 cursor-pointer font-bold hover:underline p-0"
        >
          {isLogin ? "Create an account" : "Sign in instead"}
        </button>
      </p>
    </div>
  );
}
