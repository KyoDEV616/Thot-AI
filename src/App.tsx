import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "./store";
import { ChatPage } from "./pages/ChatPage";
import { SettingsPanel } from "./components/Settings/SettingsPanel";
import { SetupWizard } from "./components/SetupWizard";

export default function App() {
  const { theme, setBackendPort, darkMode, settingsOpen, firstRunDone, availableModels } = useStore();
  const [wizardDismissed, setWizardDismissed] = useState(false);

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

  const showWizard = !firstRunDone && !wizardDismissed && availableModels.length === 0;

  return (
    <div className="h-screen w-screen flex overflow-hidden select-none"
         style={{ background: "var(--color-bg-primary)" }}>
      {/* ChatPage mounts underneath so Ollama polling starts immediately */}
      <ChatPage />
      {settingsOpen && <SettingsPanel />}
      {showWizard && (
        <SetupWizard onDone={() => setWizardDismissed(true)} />
      )}
    </div>
  );
}
