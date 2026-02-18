import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

/* ---------- Types & Schemas ---------- */

export const RegisterInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginInput = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterData = z.infer<typeof RegisterInput>;
export type LoginData = z.infer<typeof LoginInput>;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  data: {
    user: User;
  };
}

/* ---------- API Object ---------- */

export const authApi = {
  login: async (data: LoginData): Promise<User> => {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    return response.data.data.user;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<AuthResponse>("/api/auth/register", data);
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },

  getMe: async (): Promise<User | null> => {
    try {
      const response = await api.get<AuthResponse>("/api/auth/me");
      return response.data.data.user;
    } catch (e: any) {
      if (e.response?.status === 401) return null;
      throw e;
    }
  },
};

/* ---------- Query Keys ---------- */

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

/* ---------- Hooks ---------- */

// Get current user (me)
export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: true, // keeps session honest
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Login failed";
      toast.error(message);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Registration failed";
      toast.error(message);
    },
  });
};

function clearAuthState(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.setQueryData(authKeys.user(), null);
  queryClient.removeQueries({ queryKey: authKeys.user() });
}

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuthState(queryClient);
      toast.success("Logged out successfully");
      navigate({ to: "/auth" });
    },
    onError: () => {
      // Clear client state and redirect even on error (e.g. 401, network)
      // so the user is not stuck unable to log out
      clearAuthState(queryClient);
      toast.error("Logout failed");
      navigate({ to: "/auth" });
    },
  });
};
