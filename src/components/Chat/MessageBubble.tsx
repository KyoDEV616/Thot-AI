import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type Message } from "../../store";
import { ThotLogo } from "../ThotLogo";
import { User, Copy, Check } from "lucide-react";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: isUser
            ? "var(--color-accent-primary)33"
            : "var(--color-bg-tertiary)",
          border: `1px solid ${isUser ? "var(--color-accent-primary)44" : "var(--color-border)"}`,
        }}
      >
        {isUser ? (
          <User size={14} style={{ color: "var(--color-accent-primary)" }} />
        ) : (
          <ThotLogo size={14} />
        )}
      </div>

      {/* Bubble + copy button */}
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: isUser
              ? "var(--color-accent-primary)22"
              : "var(--color-bg-secondary)",
            border: `1px solid ${isUser ? "var(--color-accent-primary)44" : "var(--color-border)"}`,
            borderRadius: isUser
              ? "16px 16px 4px 16px"
              : "16px 16px 16px 4px",
          }}
        >
          {isUser ? (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--color-text-primary)" }}
            >
              {message.content}
            </p>
          ) : (
            <div className="prose-thot text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || "…"}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button — only for assistant messages */}
        {!isUser && message.content && (
          <motion.button
            onClick={copyToClipboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="self-start flex items-center gap-1 px-2 py-0.5 rounded text-xs opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "check" : "copy"}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copiado" : "Copiar"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
