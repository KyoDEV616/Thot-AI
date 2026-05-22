import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "./store";
import { ChatPage } from "./pages/ChatPage";
import { SettingsPanel } from "./components/Settings/SettingsPanel";

export default function App() {
  const { theme, setBackendPort, darkMode, settingsOpen } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-ocean", "theme-forest");
    if (theme === "ocean") root.classList.add("theme-ocean");
    if (theme === "forest") root.classList.add("theme-forest");
  }, [theme]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    invoke<number>("get_backend_port")
      .then(setBackendPort)
      .catch(() => {});
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden select-none"
         style={{ background: "var(--color-bg-primary)" }}>
      <ChatPage />
      {settingsOpen && <SettingsPanel />}
    </div>
  );
}
