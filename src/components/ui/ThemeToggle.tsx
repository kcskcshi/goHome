"use client";

import { useEffect, useState } from "react";
import { Switch } from "./switch";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs">🌞</span>
      <Switch checked={isDark} onCheckedChange={setIsDark} />
      <span className="text-xs">🌚</span>
    </div>
  );
} 