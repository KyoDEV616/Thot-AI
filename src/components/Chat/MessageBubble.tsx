import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type Message } from "../../store";
import { ThotLogo } from "../ThotLogo";
import { User } from "lucide-react";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
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

      {/* Bubble */}
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3"
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
    </motion.div>
  );
}
