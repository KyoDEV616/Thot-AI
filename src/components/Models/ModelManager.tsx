import { useState, useEffect } from "react";
import { Trash2, Download, RefreshCw } from "lucide-react";
import { useStore } from "../../store";

interface InstalledModel {
  name: string;
  size_gb: number;
  parameter_size: string;
  quantization: string;
  modified_at: string;
}

interface CatalogModel {
  name: string;
  label: string;
  size: string;
  description: string;
}

interface PullProgress {
  modelName: string;
  status: string;
  percent: number;
  done: boolean;
  error: string | null;
}

export function ModelManager() {
  const { backendPort } = useStore();
  const [installed, setInstalled] = useState<InstalledModel[]>([]);
  const [catalog, setCatalog] = useState<CatalogModel[]>([]);
  const [customName, setCustomName] = useState("");
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchInstalled = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${backendPort}/api/models/`);
      if (res.ok) {
        const data = await res.json();
        setInstalled(data.models ?? []);
      }
    } catch {}
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${backendPort}/api/models/catalog`);
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.catalog ?? []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchInstalled();
    fetchCatalog();
  }, [backendPort]);

  const deleteModel = async (name: string) => {
    try {
      await fetch(`http://127.0.0.1:${backendPort}/api/models/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      await fetchInstalled();
    } catch {}
    setConfirmDelete(null);
  };

  const pullModel = async (modelName: string) => {
    if (!modelName.trim()) return;
    setPullProgress({ modelName, status: "Iniciando...", percent: 0, done: false, error: null });
    try {
      const response = await fetch(`http://127.0.0.1:${backendPort}/api/models/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.status === "done") {
              setPullProgress({ modelName, status: "Completado", percent: 100, done: true, error: null });
              await fetchInstalled();
              break outer;
            }
            if (data.status === "error") {
              setPullProgress({ modelName, status: data.status, percent: 0, done: false, error: data.error ?? "Error desconocido" });
              break outer;
            }
            setPullProgress({ modelName, status: data.status ?? "", percent: data.percent ?? 0, done: false, error: null });
          } catch {}
        }
      }
    } catch (err) {
      setPullProgress((prev) => prev ? { ...prev, error: "Error de conexión", done: false } : null);
    }
  };

  const barStyle = (percent: number) => ({
    width: `${percent}%`,
    background: "var(--color-accent-primary)",
    height: "4px",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Installed models */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Modelos instalados
          </h3>
          <button
            onClick={() => { setLoading(true); fetchInstalled().finally(() => setLoading(false)); }}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {installed.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            No hay modelos instalados.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {installed.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {m.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {m.size_gb ? `${m.size_gb.toFixed(1)} GB` : ""}
                    {m.parameter_size ? ` · ${m.parameter_size}` : ""}
                    {m.quantization ? ` · ${m.quantization}` : ""}
                  </span>
                </div>
                {confirmDelete === m.name ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteModel(m.name)}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ background: "#ef4444", color: "white" }}
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 rounded text-xs"
                      style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(m.name)}
                    className="p-1.5 rounded hover:opacity-80 transition-opacity"
                    style={{ color: "#ef4444" }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pull progress */}
      {pullProgress && (
        <div
          className="p-3 rounded-lg"
          style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
              {pullProgress.modelName}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {pullProgress.done ? "✓ Listo" : pullProgress.error ? "✗ Error" : `${Math.round(pullProgress.percent)}%`}
            </span>
          </div>
          <div style={{ background: "var(--color-border)", height: "4px", borderRadius: "2px" }}>
            <div style={barStyle(pullProgress.percent)} />
          </div>
          <p className="text-xs mt-1" style={{ color: pullProgress.error ? "#ef4444" : "var(--color-text-muted)" }}>
            {pullProgress.error ?? pullProgress.status}
          </p>
          {!pullProgress.done && !pullProgress.error && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Para cancelar, cerrá la aplicación (Ollama no soporta cancelación por API).
            </p>
          )}
        </div>
      )}

      {/* Download custom model */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Descargar modelo
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ej: deepseek-r1:7b, llama3.2, mistral"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { pullModel(customName); setCustomName(""); } }}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            onClick={() => { pullModel(customName); setCustomName(""); }}
            disabled={!customName.trim() || (pullProgress !== null && !pullProgress.done && !pullProgress.error)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: "var(--color-accent-primary)", color: "white" }}
          >
            <Download size={14} />
            Descargar
          </button>
        </div>
      </section>

      {/* Catalog */}
      {catalog.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
            Catálogo recomendado
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {catalog.map((m) => (
              <button
                key={m.name}
                onClick={() => pullModel(m.name)}
                disabled={pullProgress !== null && !pullProgress.done && !pullProgress.error}
                className="text-left p-3 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {m.label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{m.size}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {m.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
