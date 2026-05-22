import { motion } from "framer-motion";
import { ThotLogo } from "../ThotLogo";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex gap-3"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <ThotLogo size={14} />
      </div>
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px 16px 16px 4px",
        }}
      >
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-accent-primary)" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-accent-primary)" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-accent-primary)" }} />
      </div>
    </motion.div>
  );
}
