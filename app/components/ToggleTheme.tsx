"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ToggleTheme() {
  const [theme, setTheme] = useState<"eglise" | "eglise-dark">("eglise");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "eglise-dark" || savedTheme === "eglise") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "eglise");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "eglise" ? "eglise-dark" : "eglise";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-circle btn-ghost btn-sm"
      aria-label="Changer le thème d'affichage"
      title={theme === "eglise" ? "Activer le mode sombre" : "Activer le mode clair"}
    >
      {theme === "eglise" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}