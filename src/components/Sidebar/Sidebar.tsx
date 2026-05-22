import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageSquare } from "lucide-react";
import { useStore, type Conversation } from "../../store";
import { useState } from "react";

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-start gap-2.5 group"
      style={{
        background: isActive ? "var(--color-accent-primary)22" : "transparent",
        border: isActive
          ? "1px solid var(--color-accent-primary)44"
          : "1px solid transparent",
        color: isActive ? "var(--color-accent-secondary)" : "var(--color-text-secondary)",
      }}
    >
      <MessageSquare size={14} className="mt-0.5 shrink-0" />
      <span className="text-sm truncate leading-snug">{conv.title}</span>
    </button>
  );
}

export function Sidebar() {
  const {
    sidebarOpen,
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
  } = useStore();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-col shrink-0 overflow-hidden h-full"
          style={{
            background: "var(--color-bg-secondary)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <div className="p-3 flex flex-col gap-2 shrink-0">
            <button
              onClick={() => createConversation()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary)22)",
                border: "1px solid var(--color-accent-primary)66",
                color: "var(--color-text-primary)",
              }}
            >
              <Plus size={16} />
              Nueva conversación
            </button>

            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Search size={14} style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "var(--color-text-primary)" }}
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">
            {filtered.length === 0 ? (
              <p
                className="text-xs text-center mt-8 px-4"
                style={{ color: "var(--color-text-muted)" }}
              >
                {search ? "Sin resultados" : "No hay conversaciones aún"}
              </p>
            ) : (
              filtered.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConversationId}
                  onClick={() => setActiveConversation(conv.id)}
                />
              ))
            )}
          </nav>

          <div
            className="p-3 text-center shrink-0"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Thot AI · 100% local · Sin telemetría
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
