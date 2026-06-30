import { useEffect, useState } from "react";
import { StatusDot } from "./status-dot";

const auhFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const utcFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatTime(date: Date, formatter: Intl.DateTimeFormat): string[] {
  const parts = formatter.formatToParts(date);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  const s = parts.find((p) => p.type === "second")?.value ?? "00";
  return [h, m, s];
}

export function OpsClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [ah, am, as_] = formatTime(now, auhFormatter);
  const [uh, um, us] = formatTime(now, utcFormatter);

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground select-none">
      <StatusDot variant="live" pulse />
      <span className="text-foreground/70">AUH</span>
      <span>
        {ah}
        <Colon />
        {am}
        <Colon />
        {as_}
      </span>
      <span className="text-muted-foreground/40 px-0.5">·</span>
      <span className="text-foreground/50">UTC</span>
      <span>
        {uh}
        <Colon />
        {um}
        <Colon />
        {us}
      </span>
    </div>
  );
}

function Colon() {
  return <span className="ops-colon">:</span>;
}
