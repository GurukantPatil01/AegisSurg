import React, { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("aegis_theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("aegis_theme", theme);
    } catch {
      // Ignore in restricted environments
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, setTheme };
}

interface ThemeToggleProps {
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      aria-label={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: theme === "dark" ? "#1f222a" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#000000",
        border: theme === "dark" ? "2px solid #52525b" : "2px solid #000000",
        padding: "5px 10px",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        fontWeight: 800,
        textTransform: "uppercase",
        cursor: "pointer",
        boxShadow: theme === "dark" ? "2px 2px 0px #52525b" : "2px 2px 0px #000000",
        ...style,
      }}
    >
      {theme === "dark" ? "🌙 DARK" : "☀️ LIGHT"}
    </button>
  );
};
