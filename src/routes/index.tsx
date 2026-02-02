import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
            <Plane className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight">
          Skyshine Operations
        </h1>
        <p className="text-xl text-slate-300 max-w-md mx-auto">
          Manage your drone operations, sites, and schedules all in one place.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            to="/auth"
            className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
