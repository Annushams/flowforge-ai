import { Moon, Sun } from "lucide-react";
import { useState } from "react";

import { getStoredTheme, setTheme } from "../lib/theme";
import type { Theme } from "../types/theme";

export function ThemeToggle() {
  const [theme, setCurrentTheme] = useState<Theme>(() => getStoredTheme());

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setCurrentTheme(nextTheme);
    setTheme(nextTheme);
  };

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${
        theme === "dark" ? "light" : "dark"
      } mode`}
      className="
        flex h-8 w-8 items-center justify-center
        rounded-md border
        border-[var(--border)]
        bg-[var(--bg-muted)]
        text-[var(--text)]
        transition
        hover:bg-[var(--bg-hover)]
        hover:text-[var(--text-h)]
      "
    >
      <Icon size={15} />
    </button>
  );
}