import { cn } from "@/lib/utils";

type StatusDotVariant = "live" | "idle" | "warn" | "down" | "ok";

const variantColor: Record<StatusDotVariant, string> = {
  live: "bg-success",
  idle: "bg-muted-foreground",
  warn: "bg-warning",
  down: "bg-destructive",
  ok:   "bg-teal",
};

interface StatusDotProps {
  variant: StatusDotVariant;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ variant, pulse = false, className }: StatusDotProps) {
  const color = variantColor[variant];

  if (pulse) {
    return (
      <span className={cn("relative flex h-1.5 w-1.5 shrink-0", className)}>
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            color
          )}
        />
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", color)} />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex h-1.5 w-1.5 shrink-0 rounded-full", color, className)}
    />
  );
}
