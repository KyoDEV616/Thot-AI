import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "./store";
import { ChatPage } from "./pages/ChatPage";

export default function App() {
  const { theme, setBackendPort } = useStore();

  useEffect(() => {
    // Apply theme class to root html element
    const root = document.documentElement;
    root.classList.remove("theme-ocean", "theme-forest");
    if (theme === "ocean") root.classList.add("theme-ocean");
    if (theme === "forest") root.classList.add("theme-forest");
  }, [theme]);

  useEffect(() => {
    // Get actual backend port from Tauri (backend starts on a random free port)
    invoke<number>("get_backend_port")
      .then(setBackendPort)
      .catch(() => {
        // Running outside Tauri (dev without desktop) — keep default 8000
      });
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden select-none"
         style={{ background: "var(--color-bg-primary)" }}>
      <ChatPage />
    </div>
  );
}
