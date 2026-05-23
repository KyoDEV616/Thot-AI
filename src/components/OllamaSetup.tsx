import { motion } from "framer-motion";
import { ExternalLink, Terminal, RefreshCw } from "lucide-react";

interface Props {
  onDismiss: () => void;
}

export function OllamaSetup({ onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Ollama no está corriendo
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Thot AI necesita Ollama para funcionar. Seguí los pasos para configurarlo.
          </p>
        </div>

        {/* Step 1 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 font-semibold mt-0.5"
              style={{ background: "var(--color-accent-primary)", color: "white" }}
            >1</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Instalá Ollama
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Descargá e instalá Ollama desde el sitio oficial.
              </p>
              <a
                href="https://ollama.com/download"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium mt-1"
                style={{ color: "var(--color-accent-primary)" }}
              >
                <ExternalLink size={11} />
                ollama.com/download
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 font-semibold mt-0.5"
              style={{ background: "var(--color-accent-primary)", color: "white" }}
            >2</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Iniciá Ollama
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Si ya lo tenés instalado, abrí una terminal y ejecutá:
              </p>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg mt-1"
                style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
              >
                <Terminal size={12} style={{ color: "var(--color-text-muted)" }} />
                <code className="text-xs" style={{ color: "var(--color-accent-secondary)" }}>
                  ollama serve
                </code>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 font-semibold mt-0.5"
              style={{ background: "var(--color-accent-primary)", color: "white" }}
            >3</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Descargá un modelo
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                En otra terminal, descargá tu primer modelo:
              </p>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg mt-1"
                style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
              >
                <Terminal size={12} style={{ color: "var(--color-text-muted)" }} />
                <code className="text-xs" style={{ color: "var(--color-accent-secondary)" }}>
                  ollama pull llama3.2
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "var(--color-accent-primary)",
              color: "white",
            }}
          >
            <RefreshCw size={14} />
            Ya lo tengo, reintentar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
