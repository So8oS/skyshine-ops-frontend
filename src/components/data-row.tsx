import { cn } from "@/lib/utils";

interface DataRowProps {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
  className?: string;
}

export function DataRow({ label, value, mono = false, className }: DataRowProps) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-1.5 border-b border-transparent hover:border-border transition-colors",
        className
      )}
    >
      <span className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
        {label}
      </span>
      <span className={cn("text-sm text-right", mono && "font-mono tracking-tight")}>
        {value}
      </span>
    </div>
  );
}
