import { useState } from "react";
import { Moon, Sun, Settings, PanelLeftClose, Check } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useStore, type Theme } from "../store";
import { ThotLogo } from "./ThotLogo";

const THEMES: { value: Theme; label: string }[] = [
  { value: "pyramid", label: "Pyramid" },
  { value: "ocean", label: "Ocean" },
  { value: "forest", label: "Forest" },
];

export function TitleBar() {
  const { theme, setTheme, toggleSidebar, darkMode, setDarkMode, setSettingsOpen } = useStore();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <div
      data-tauri-drag-region
      className="h-10 flex items-center justify-between px-4 shrink-0"
      style={{
        background: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg transition-colors duration-150 hover:opacity-80"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <PanelLeftClose size={16} />
        </button>
        <div className="flex items-center gap-1.5">
          <ThotLogo size={18} />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: "var(--color-accent-secondary)" }}
          >
            Thot AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Theme selector */}
        <div className="relative">
          <button
            className="px-2 py-1 rounded-lg text-xs transition-colors duration-150 hover:opacity-80"
            style={{
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-tertiary)",
            }}
            onClick={() => setThemeOpen((v) => !v)}
          >
            {THEMES.find((t) => t.value === theme)?.label ?? "Theme"}
          </button>
          {themeOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50 min-w-[100px]"
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:opacity-80 transition-opacity"
                  style={{ color: "var(--color-text-primary)" }}
                  onClick={() => {
                    setTheme(t.value);
                    setThemeOpen(false);
                  }}
                >
                  {t.label}
                  {theme === t.value && (
                    <Check size={10} style={{ color: "var(--color-accent-primary)" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          className="p-1.5 rounded-lg transition-colors duration-150 hover:opacity-80"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Settings */}
        <button
          className="p-1.5 rounded-lg transition-colors duration-150 hover:opacity-80"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={16} />
        </button>

        {/* Window controls — use Rust commands for guaranteed native access */}
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => invoke("minimize_window")}
            title="Minimize"
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors"
          />
          <button
            onClick={() => invoke("toggle_maximize_window")}
            title="Maximize"
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors"
          />
          <button
            onClick={() => invoke("close_window")}
            title="Close"
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
