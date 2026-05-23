import { useState, useEffect } from "react";
import { X, Cpu, Shield, Sliders, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useStore, type Theme } from "../../store";
import { ModelManager } from "../Models/ModelManager";

type Tab = "general" | "system" | "models" | "privacy";

interface SystemStats {
  cpu_percent: number;
  cpu_cores: number;
  ram_used_gb: number;
  ram_total_gb: number;
  ram_percent: number;
  ollama_ram_mb: number;
  ollama_running: boolean;
  platform: string;
  gpu_info: string;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: "pyramid", label: "Pyramid" },
  { value: "ocean", label: "Ocean" },
  { value: "forest", label: "Forest" },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ background: "var(--color-border)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.min(100, value)}%`,
          height: "100%",
          background: value > 85 ? "#ef4444" : "var(--color-accent-primary)",
          borderRadius: "3px",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

export function SettingsPanel() {
  const {
    setSettingsOpen,
    systemPrompt,
    setSystemPrompt,
    ollamaStatus,
    theme,
    setTheme,
    darkMode,
    setDarkMode,
    backendPort,
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [sysStats, setSysStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    if (activeTab !== "system") return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${backendPort}/api/system/stats`);
        if (res.ok) setSysStats(await res.json());
      } catch {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [activeTab, backendPort]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Sliders size={14} /> },
    { id: "system", label: "Sistema", icon: <Cpu size={14} /> },
    { id: "models", label: "Modelos", icon: <Package size={14} /> },
    { id: "privacy", label: "Privacidad", icon: <Shield size={14} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={() => setSettingsOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          maxHeight: "80vh",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Configuración
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 px-6 pt-3 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg transition-colors relative"
              style={{
                color: activeTab === tab.id ? "var(--color-accent-secondary)" : "var(--color-text-muted)",
                borderBottom: activeTab === tab.id ? "2px solid var(--color-accent-primary)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "general" && (
            <div className="flex flex-col gap-5">
              {/* System prompt */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Prompt del sistema
                </label>
                <textarea
                  rows={5}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none leading-relaxed"
                  style={{
                    background: "var(--color-bg-tertiary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Ollama status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Estado de Ollama
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: ollamaStatus === "online" ? "#22c55e" : ollamaStatus === "checking" ? "#f59e0b" : "#ef4444" }}
                  />
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {ollamaStatus === "online" ? "Conectado" : ollamaStatus === "checking" ? "Verificando..." : "Desconectado"}
                  </span>
                </div>
              </div>

              {/* Theme selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Tema de color
                </label>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: theme === t.value ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)",
                        border: `1px solid ${theme === t.value ? "var(--color-accent-primary)" : "var(--color-border)"}`,
                        color: theme === t.value ? "white" : "var(--color-text-muted)",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark mode toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Modo oscuro
                </span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="relative w-10 h-5 rounded-full transition-colors duration-200"
                  style={{ background: darkMode ? "var(--color-accent-primary)" : "var(--color-border)" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                    style={{ transform: darkMode ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="flex flex-col gap-5">
              {!sysStats ? (
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Cargando estadísticas...</p>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>CPU</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {Math.round(sysStats.cpu_percent)}% ({sysStats.cpu_cores} cores)
                      </span>
                    </div>
                    <ProgressBar value={sysStats.cpu_percent} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>RAM</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {sysStats.ram_used_gb.toFixed(1)} / {sysStats.ram_total_gb.toFixed(1)} GB ({Math.round(sysStats.ram_percent)}%)
                      </span>
                    </div>
                    <ProgressBar value={sysStats.ram_percent} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>GPU</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sysStats.gpu_info || "No detectada"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Ollama RAM</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sysStats.ollama_ram_mb} MB</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Plataforma</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sysStats.platform}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Ollama</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: sysStats.ollama_running ? "#22c55e" : "#ef4444" }}
                      />
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {sysStats.ollama_running ? "Corriendo" : "Detenido"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "models" && <ModelManager />}

          {activeTab === "privacy" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Thot AI está diseñado con la privacidad como principio central. Todo lo que hacés queda en tu computadora.
              </p>
              {[
                "Todas las conversaciones se guardan localmente en ~/.thot-ai/conversations.db",
                "Sin telemetría, sin analytics, sin conexiones externas a menos que uses búsqueda web",
                "La búsqueda web usa DuckDuckGo — sin API key, sin seguimiento",
                "La generación de imágenes corre completamente local via Stable Diffusion",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 p-3 rounded-lg"
                  style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
                >
                  <span style={{ color: "var(--color-accent-primary)" }}>✓</span>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
