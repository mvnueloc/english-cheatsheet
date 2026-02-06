"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "english-cheatsheet:theme";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle({
  className,
  showLabel = true,
}: Readonly<{ className?: string; showLabel?: boolean }>) {
  const [theme, setTheme] = React.useState<ThemeMode>("light");

  React.useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // noop
    }
  };

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        showLabel
          ? "w-full justify-start gap-2"
          : "w-10 justify-center gap-0 px-0",
        className,
      )}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      {showLabel && <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>}
    </Button>
  );
}
