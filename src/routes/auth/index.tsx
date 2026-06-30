import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthForm } from "../../components/AuthForm";
import { authKeys, authApi } from "@/actions/auth";

export const Route = createFileRoute("/auth/")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: authKeys.user(),
      queryFn: authApi.getMe,
    });

    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-background dashboard-grid-bg flex items-center justify-center px-4">
      <AuthForm />
    </div>
  );
}
