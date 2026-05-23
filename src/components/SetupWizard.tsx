import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Zap, Brain, CheckCircle, Loader2, X } from "lucide-react";
import { useStore } from "../store";

type WizardStep = "welcome" | "waiting-ollama" | "select-model" | "downloading";

interface PullProgress {
  status: string;
  percent: number;
  done: boolean;
  error: string | null;
}

const MODELS = [
  {
    name: "llama3.2:1b",
    label: "Llama 3.2 · 1B",
    badge: "Recomendado",
    size: "830 MB",
    description: "El más rápido. Ideal para empezar con Thot AI.",
    Icon: Zap,
  },
  {
    name: "llama3.2:3b",
    label: "Llama 3.2 · 3B",
    badge: "Mejor calidad",
    size: "~2 GB",
    description: "Más capaz. Requiere al menos 8 GB de RAM.",
    Icon: Brain,
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export function SetupWizard({ onDone }: { onDone: () => void }) {
  const { ollamaStatus, availableModels, setAvailableModels, backendPort, setFirstRunDone } = useStore();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [selected, setSelected] = useState<string>("llama3.2:1b");
  const [progress, setProgress] = useState<PullProgress | null>(null);

  const dismiss = () => {
    setFirstRunDone(true);
    onDone();
  };

  // Existing users who already have models — skip immediately
  useEffect(() => {
    if (availableModels.length > 0) dismiss();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance from waiting-ollama once Ollama comes online
  useEffect(() => {
    if (step === "waiting-ollama" && ollamaStatus === "online") {
      const t = setTimeout(() => setStep("select-model"), 800);
      return () => clearTimeout(t);
    }
  }, [step, ollamaStatus]);

  const handleStart = () => {
    setStep(ollamaStatus === "online" ? "select-model" : "waiting-ollama");
  };

  const handleDownload = async () => {
    setStep("downloading");
    setProgress({ status: "Iniciando...", percent: 0, done: false, error: null });
    try {
      const res = await fetch(`http://127.0.0.1:${backendPort}/api/models/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selected }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.status === "done") {
              setProgress({ status: "Completado", percent: 100, done: true, error: null });
              // Refresh available models
              try {
                const r = await fetch("http://localhost:11434/api/tags");
                if (r.ok) {
                  const d = await r.json();
                  setAvailableModels((d.models ?? []).map((m: { name: string }) => m.name));
                }
              } catch {}
              break outer;
            }
            if (data.status === "error") {
              setProgress({ status: "Error", percent: 0, done: false, error: data.message ?? "Error desconocido" });
              break outer;
            }
            setProgress({ status: data.status ?? "", percent: data.percent ?? 0, done: false, error: null });
          } catch {}
        }
      }
    } catch {
      setProgress((p) => p ? { ...p, error: "Error de conexión", done: false } : null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">𓂀</span>
            <span className="text-base font-semibold" style={{ color: "var(--color-accent-secondary)" }}>
              Thot AI
            </span>
          </div>
          <motion.button
            onClick={dismiss}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.12, ease }}
            className="p-1.5 rounded-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={15} />
          </motion.button>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" initial={false}>
          {step === "welcome" && (
            <StepPanel key="welcome">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                  Bienvenido a Thot AI
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-muted)" }}>
                  Tu asistente de IA completamente local. Todo corre en tu computadora —
                  sin servidores externos, sin telemetría, sin límites.
                </p>
                <p className="text-xs mb-6 px-4" style={{ color: "var(--color-text-muted)" }}>
                  Para funcionar necesitás <strong style={{ color: "var(--color-text-secondary)" }}>Ollama</strong> instalado
                  y al menos un modelo de IA descargado. Te vamos a guiar en ambos pasos.
                </p>
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15, ease }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--color-accent-primary)", color: "white" }}
                >
                  Comenzar configuración
                </motion.button>
              </div>
            </StepPanel>
          )}

          {step === "waiting-ollama" && (
            <StepPanel key="waiting-ollama">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="inline-flex mb-4"
                >
                  <Loader2 size={32} style={{ color: "var(--color-accent-primary)" }} />
                </motion.div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                  {ollamaStatus === "online" ? "Ollama conectado" : "Esperando Ollama..."}
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {ollamaStatus === "online"
                    ? "Listo. Continuando..."
                    : "Asegurate de que Ollama esté corriendo. Si no lo tenés instalado, descargalo desde ollama.com"}
                </p>
                {ollamaStatus !== "online" && (
                  <a
                    href="https://ollama.com/download"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-xs font-medium underline"
                    style={{ color: "var(--color-accent-primary)" }}
                  >
                    ollama.com/download
                  </a>
                )}
              </div>
            </StepPanel>
          )}

          {step === "select-model" && (
            <StepPanel key="select-model">
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                Elegí tu primer modelo
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                Se descargará una sola vez. Después podés agregar o cambiar modelos desde Configuración.
              </p>
              <div className="flex flex-col gap-2 mb-5">
                {MODELS.map((m) => {
                  const isSelected = selected === m.name;
                  return (
                    <motion.button
                      key={m.name}
                      onClick={() => setSelected(m.name)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.12, ease }}
                      className="text-left p-3.5 rounded-xl flex gap-3 items-start"
                      style={{
                        background: isSelected ? "var(--color-accent-primary)18" : "var(--color-bg-tertiary)",
                        border: `1.5px solid ${isSelected ? "var(--color-accent-primary)" : "var(--color-border)"}`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: isSelected ? "var(--color-accent-primary)22" : "var(--color-bg-secondary)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <m.Icon size={15} style={{ color: "var(--color-accent-primary)" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {m.label}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: "var(--color-accent-primary)22",
                              color: "var(--color-accent-primary)",
                            }}
                          >
                            {m.badge}
                          </span>
                          <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>
                            {m.size}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {m.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--color-accent-primary)", color: "white" }}
              >
                <Download size={15} />
                Descargar {MODELS.find((m) => m.name === selected)?.label}
              </motion.button>
            </StepPanel>
          )}

          {step === "downloading" && progress && (
            <StepPanel key="downloading">
              {progress.done ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="inline-flex mb-4"
                  >
                    <CheckCircle size={40} style={{ color: "#22c55e" }} />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Modelo listo
                  </h3>
                  <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
                    Todo configurado. Podés empezar a usar Thot AI ahora.
                  </p>
                  <motion.button
                    onClick={dismiss}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15, ease }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "var(--color-accent-primary)", color: "white" }}
                  >
                    Empezar a usar Thot AI
                  </motion.button>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                    Descargando modelo...
                  </h3>
                  <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                    Esto puede tardar unos minutos dependiendo de tu conexión. No cierres la app.
                  </p>

                  {/* Progress bar */}
                  <div
                    className="rounded-full overflow-hidden mb-2"
                    style={{ background: "var(--color-border)", height: "6px" }}
                  >
                    <motion.div
                      animate={{ width: `${progress.percent}%` }}
                      transition={{ duration: 0.3, ease }}
                      style={{
                        height: "100%",
                        background: "var(--color-accent-primary)",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: progress.error ? "#ef4444" : "var(--color-text-muted)" }}>
                      {progress.error ?? progress.status}
                    </p>
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {Math.round(progress.percent)}%
                    </span>
                  </div>

                  {progress.error && (
                    <motion.button
                      onClick={() => { setStep("select-model"); setProgress(null); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.12, ease }}
                      className="mt-4 w-full py-2 rounded-xl text-sm font-medium"
                      style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
                    >
                      Reintentar
                    </motion.button>
                  )}
                </div>
              )}
            </StepPanel>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 py-5"
    >
      {children}
    </motion.div>
  );
}
