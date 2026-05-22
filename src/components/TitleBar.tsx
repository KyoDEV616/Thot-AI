import { Moon, Sun, Settings, PanelLeftClose } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useStore } from "../store";
import { ThotLogo } from "./ThotLogo";

export function TitleBar() {
  const { theme, setTheme, toggleSidebar, sidebarOpen } = useStore();

  const toggleDark = () => {
    setTheme(theme === "pyramid" ? "pyramid" : theme);
    document.documentElement.classList.toggle("dark");
  };

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
        <button
          className="p-1.5 rounded-lg transition-colors duration-150 hover:opacity-80"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={toggleDark}
        >
          <Sun size={16} />
        </button>
        <button
          className="p-1.5 rounded-lg transition-colors duration-150 hover:opacity-80"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Settings size={16} />
        </button>
        {/* Window controls (decorations: false) */}
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors"
          />
          <button
            onClick={() => getCurrentWindow().toggleMaximize()}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors"
          />
          <button
            onClick={() => getCurrentWindow().close()}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
