import { useEffect, useState } from "react";

const LINES = [
  "INITIALIZING OPS CENTER",
  "LOADING FLEET STATUS",
  "READY",
];

const STORAGE_KEY = "skyshine_boot_seen";

export function BootSplash({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(STORAGE_KEY));
  const [lineIndex, setLineIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 200);
  };

  useEffect(() => {
    if (!visible) return;

    const handler = () => dismiss();
    document.addEventListener("keydown", handler);
    document.addEventListener("click", handler);

    const lineTimer = setInterval(() => {
      setLineIndex((i) => {
        if (i + 1 >= LINES.length) {
          clearInterval(lineTimer);
          setTimeout(dismiss, 200);
        }
        return Math.min(i + 1, LINES.length - 1);
      });
    }, 200);

    return () => {
      clearInterval(lineTimer);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("click", handler);
    };
  }, [visible]);

  return (
    <>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
          style={{ opacity: fading ? 0 : 1, transition: fading ? "opacity 200ms" : undefined }}
        >
          <div className="space-y-1 select-none">
            {LINES.slice(0, lineIndex + 1).map((line, i) => (
              <p
                key={i}
                className="font-mono text-sm uppercase tracking-widest"
                style={{ color: i === lineIndex ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                {line}
                {i === lineIndex && (
                  <span className="ops-colon ml-0.5">▌</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
