"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
export function Appearance() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { theme, setTheme } = useTheme();
  return <label className="flex items-center gap-3 text-sm">Appearance<select aria-label="Appearance" value={mounted ? theme : "light"} onChange={e => setTheme(e.target.value)} className="min-h-11 rounded-md border border-border bg-surface px-3 text-foreground"><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></label>;
}
