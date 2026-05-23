import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Wifi, WifiOff } from "lucide-react";
import { useStore, type Message } from "../../store";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ModelSelector } from "./ModelSelector";
import { OllamaSetup } from "../OllamaSetup";

interface SystemStats {
  cpu_percent: number;
  cpu_cores: number;
  ram_used_gb: number;
  ram_total_gb: number;
  ollama_running: boolean;
}

export function ChatArea() {
  const {
    conversations,
    activeConversationId,
    addMessage,
    updateLastMessage,
    isStreaming,
    setIsStreaming,
    selectedModel,
    backendPort,
    ollamaStatus,
    setOllamaStatus,
    availableModels,
    setAvailableModels,
    systemPrompt,
    createConversation,
    setActiveConversation,
  } = useStore();

  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [sysStats, setSysStats] = useState<SystemStats | null>(null);
  const [showOllamaSetup, setShowOllamaSetup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ollamaOfflineSince = useRef<number | null>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = activeConversation?.messages ?? [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Poll system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${backendPort}/api/system/stats`);
        if (res.ok) setSysStats(await res.json());
      } catch {
        // silent — widget simply won't show
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [backendPort]);

  // Poll Ollama status every 2s for real-time feedback
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch(`http://localhost:11434/api/tags`);
        if (res.ok) {
          const data = await res.json();
          const models: string[] = (data.models ?? []).map((m: { name: string }) => m.name);
          setAvailableModels(models);
          setOllamaStatus("online");
          ollamaOfflineSince.current = null;
          setShowOllamaSetup(false);
        } else {
          setOllamaStatus("offline");
          if (!ollamaOfflineSince.current) ollamaOfflineSince.current = Date.now();
          if (Date.now() - ollamaOfflineSince.current > 6000) setShowOllamaSetup(true);
        }
      } catch {
        setOllamaStatus("offline");
        if (!ollamaOfflineSince.current) ollamaOfflineSince.current = Date.now();
        if (Date.now() - ollamaOfflineSince.current > 6000) setShowOllamaSetup(true);
      }
    };

    checkOllama();
    const interval = setInterval(checkOllama, 2000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
      setActiveConversation(convId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(convId, userMessage);
    setInput("");
    setIsStreaming(true);

    const assistantId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(convId, assistantMessage);

    try {
      const response = await fetch(
        `http://127.0.0.1:${backendPort}/api/chat/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            model: selectedModel || availableModels[0] || "llama3.2",
            conversation_id: convId,
            system_prompt: systemPrompt,
          }),
        }
      );

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                accumulated += parsed.token;
                updateLastMessage(convId!, accumulated);
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err) {
      updateLastMessage(convId!, "Error al conectar con el backend. Verificá que Ollama esté corriendo.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {showOllamaSetup && (
        <OllamaSetup onDismiss={() => { setShowOllamaSetup(false); ollamaOfflineSince.current = null; }} />
      )}
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <ModelSelector />
        <div className="flex items-center gap-3">
          {sysStats && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>CPU {Math.round(sysStats.cpu_percent)}%</span>
              <span>RAM {sysStats.ram_used_gb.toFixed(1)}/{sysStats.ram_total_gb.toFixed(0)} GB</span>
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: sysStats.ollama_running ? "#22c55e" : "#ef4444" }}
                />
                Ollama
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {ollamaStatus === "online" ? (
              <Wifi size={14} style={{ color: "#22c55e" }} />
            ) : (
              <WifiOff size={14} style={{ color: "#ef4444" }} />
            )}
            <span
              className="text-xs"
              style={{
                color: ollamaStatus === "online" ? "#22c55e" : "#ef4444",
              }}
            >
              Ollama {ollamaStatus === "online" ? "conectado" : "desconectado"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="mx-auto flex flex-col gap-4" style={{ maxWidth: "var(--chat-max-width)" }}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mt-20"
            >
              <div className="mb-4 flex justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center glyph-float"
                  style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
                >
                  <span className="text-3xl">𓂀</span>
                </div>
              </div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--color-accent-secondary)" }}
              >
                Bienvenido a Thot AI
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Tu asistente local de IA. Todo queda en tu computadora.
              </motion.p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.role === "assistant" &&
            messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <motion.div
          className="mx-auto rounded-2xl overflow-hidden"
          animate={{
            boxShadow: isFocused
              ? "0 0 0 1.5px var(--color-accent-primary), 0 4px 20px rgba(0,0,0,0.15)"
              : "0 0 0 0px transparent",
            borderColor: isFocused ? "var(--color-accent-primary)" : "var(--color-border)",
          }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: "var(--chat-max-width)",
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Escribí tu mensaje... (Enter para enviar, Shift+Enter para salto de línea)"
            disabled={isStreaming}
            className="w-full resize-none bg-transparent outline-none px-4 pt-3 pb-2 text-sm leading-relaxed"
            style={{
              color: "var(--color-text-primary)",
              minHeight: "52px",
              maxHeight: "160px",
            }}
          />
          <div
            className="flex items-center justify-between px-3 pb-2"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isStreaming ? "Generando..." : "Enter para enviar · Shift+Enter para nueva línea"}
            </span>
            <motion.button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              whileHover={!input.trim() || isStreaming ? {} : { scale: 1.04 }}
              whileTap={!input.trim() || isStreaming ? {} : { scale: 0.93 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{
                background: "var(--color-accent-primary)",
                color: "white",
              }}
            >
              <Send size={14} />
              Enviar
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
