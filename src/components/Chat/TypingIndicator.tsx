import { motion } from "framer-motion";
import { ThotLogo } from "../ThotLogo";

const dotVariants = {
  idle: { y: 0, opacity: 0.3, scale: 0.8 },
  pulse: { y: -5, opacity: 1, scale: 1 },
};

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <ThotLogo size={14} />
      </motion.div>

      {/* Bubble */}
      <div
        className="rounded-2xl px-4 py-3 flex flex-col gap-2"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px 16px 16px 4px",
          minWidth: "100px",
        }}
      >
        {/* Wave dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              variants={dotVariants}
              initial="idle"
              animate="pulse"
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.15,
              }}
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-accent-primary)" }}
            />
          ))}
        </div>

        {/* Label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Pensando...
        </motion.span>
      </div>
    </motion.div>
  );
}
