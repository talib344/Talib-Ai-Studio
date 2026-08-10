import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface GeneratingProps {
  message: string;
}

export function Generating({ message }: GeneratingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex items-center gap-4 p-5"
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 ring-1 ring-white/10">
        <Sparkles className="h-5 w-5 text-primary-300" />
        <span className="absolute inset-0 animate-pulse-glow rounded-xl ring-1 ring-primary-400/40" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{message}</p>
        <p className="text-xs text-slate-400">The pipeline is running. This usually takes a few seconds.</p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
