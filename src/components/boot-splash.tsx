import { useEffect, useState, useCallback } from "react";

const LINES = [
  "SKYSHINE OPS — INITIALIZING",
  "ESTABLISHING FLEET CONNECTION",
  "LOADING SITE REGISTRY",
  "SYNCING SCHEDULE DATA",
  "READY",
];

const LINE_MS = 450;
const FADE_MS = 300;

let _triggerShow: (() => void) | null = null;

export function triggerBootSplash() {
  _triggerShow?.();
}

export function BootSplash({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const dismiss = useCallback(() => {
    setFading(true);
    setTimeout(() => setVisible(false), FADE_MS);
  }, []);

  const show = useCallback(() => {
    setFading(false);
    setLineIndex(0);
    setVisible(true);
  }, []);

  useEffect(() => {
    _triggerShow = show;
    return () => { if (_triggerShow === show) _triggerShow = null; };
  }, [show]);

  useEffect(() => {
    if (!visible || fading) return;

    const handler = () => dismiss();
    document.addEventListener("keydown", handler);
    document.addEventListener("click", handler);

    let current = 0;
    const lineTimer = setInterval(() => {
      current += 1;
      if (current >= LINES.length) {
        clearInterval(lineTimer);
        setTimeout(dismiss, LINE_MS);
        setLineIndex(LINES.length - 1);
      } else {
        setLineIndex(current);
      }
    }, LINE_MS);

    return () => {
      clearInterval(lineTimer);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("click", handler);
    };
  }, [visible, fading, dismiss]);

  return (
    <>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8"
          style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms` }}
        >
          <img
            src="/skyshinelogonobgwhite.png"
            alt="Skyshine"
            className="h-8 w-auto object-contain opacity-60"
          />
          <div className="space-y-1.5 select-none text-left">
            {LINES.slice(0, lineIndex + 1).map((line, i) => (
              <p
                key={i}
                className="font-mono text-xs uppercase tracking-widest transition-colors"
                style={{
                  color: i === lineIndex ? "var(--foreground)" : "color-mix(in srgb, var(--muted-foreground) 50%, transparent)",
                }}
              >
                <span
                  className="inline-block w-3 mr-2 text-primary"
                  style={{ opacity: i === lineIndex ? 1 : 0 }}
                >
                  ›
                </span>
                {line}
                {i === lineIndex && (
                  <span className="ops-colon ml-1 text-primary">▌</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
