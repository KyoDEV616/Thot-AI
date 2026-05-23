import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Settings, PanelLeftClose, PanelLeftOpen, Check, X, Minus, Maximize2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useStore, type Theme } from "../store";
import { ThotLogo } from "./ThotLogo";

const THEMES: { value: Theme; label: string }[] = [
  { value: "pyramid", label: "Pyramid" },
  { value: "ocean", label: "Ocean" },
  { value: "forest", label: "Forest" },
];

function WindowControl({
  color,
  hoverColor,
  onClick,
  icon,
  title,
}: {
  color: string;
  hoverColor: string;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      title={title}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.88 }}
      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="w-3 h-3 rounded-full flex items-center justify-center"
      style={{ background: hovered ? hoverColor : color }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.1 }}
            className="flex items-center justify-center"
            style={{ color: "rgba(0,0,0,0.55)" }}
          >
            {icon}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function TitleBar() {
  const { theme, setTheme, toggleSidebar, sidebarOpen, darkMode, setDarkMode, setSettingsOpen } = useStore();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <div
      data-tauri-drag-region
      className="h-10 flex items-center justify-between px-3 shrink-0"
      style={{
        background: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Left: window controls + sidebar toggle + app identity */}
      <div className="flex items-center gap-3">
        {/* macOS Tahoe window controls */}
        <div className="flex items-center gap-1.5">
          <WindowControl
            color="#ff5f57"
            hoverColor="#ff3b30"
            onClick={() => invoke("close_window")}
            icon={<X size={7} strokeWidth={2.5} />}
            title="Close"
          />
          <WindowControl
            color="#febc2e"
            hoverColor="#ff9f0a"
            onClick={() => invoke("minimize_window")}
            icon={<Minus size={7} strokeWidth={2.5} />}
            title="Minimize"
          />
          <WindowControl
            color="#28c840"
            hoverColor="#30d158"
            onClick={() => invoke("toggle_maximize_window")}
            icon={<Maximize2 size={6} strokeWidth={2.5} />}
            title="Maximize"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-4 shrink-0" style={{ background: "var(--color-border)" }} />

        {/* Sidebar toggle */}
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="p-1.5 rounded-lg"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </motion.button>

        {/* App identity */}
        <div className="flex items-center gap-2">
          <ThotLogo size={20} />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: "var(--color-accent-secondary)" }}
          >
            Thot AI
          </span>
        </div>
      </div>

      {/* Right: theme + dark mode + settings */}
      <div className="flex items-center gap-1.5">
        {/* Theme selector */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="px-2 py-1 rounded-lg text-xs"
            style={{
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-tertiary)",
            }}
            onClick={() => setThemeOpen((v) => !v)}
          >
            {THEMES.find((t) => t.value === theme)?.label ?? "Theme"}
          </motion.button>
          <AnimatePresence>
            {themeOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50 min-w-[100px]"
                style={{
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  transformOrigin: "top right",
                }}
              >
                {THEMES.map((t) => (
                  <motion.button
                    key={t.value}
                    whileHover={{ background: "var(--color-bg-tertiary)" }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left"
                    style={{ color: "var(--color-text-primary)" }}
                    onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                  >
                    {t.label}
                    {theme === t.value && (
                      <Check size={10} style={{ color: "var(--color-accent-primary)" }} />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark mode toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="p-1.5 rounded-lg"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={() => setDarkMode(!darkMode)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={darkMode ? "sun" : "moon"}
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 30 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="p-1.5 rounded-lg"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={16} />
        </motion.button>
      </div>
    </div>
  );
}
