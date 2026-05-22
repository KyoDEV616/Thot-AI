import { ChevronDown } from "lucide-react";
import { useStore } from "../../store";
import { useState } from "react";

export function ModelSelector() {
  const { availableModels, selectedModel, setSelectedModel } = useStore();
  const [open, setOpen] = useState(false);
  const display = selectedModel || availableModels[0] || "Sin modelos";

  if (availableModels.length === 0) {
    return (
      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        Ollama desconectado
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 hover:opacity-80"
        style={{
          background: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        <span className="text-xs">{display}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50 min-w-[180px] shadow-xl"
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          {availableModels.map((m) => (
            <button
              key={m}
              onClick={() => {
                setSelectedModel(m);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs transition-colors hover:opacity-80"
              style={{
                background:
                  m === (selectedModel || availableModels[0])
                    ? "var(--color-accent-primary)22"
                    : "transparent",
                color: "var(--color-text-primary)",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
