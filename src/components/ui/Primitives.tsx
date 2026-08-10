import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({ title, subtitle, icon, action }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-primary-300 ring-1 ring-white/10">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  accent?: string;
}

export function StatCard({ label, value, icon, trend, accent = "from-primary-500/20 to-accent-500/20" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass card-hover p-5"
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ring-1 ring-white/10", accent)}>
          {icon}
        </div>
        {trend && <span className="chip bg-success-500/15 text-success-400">{trend}</span>}
      </div>
      <p className="mt-4 text-3xl font-bold font-display text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</p>
    </motion.div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("glass p-5", className)}>{children}</div>;
}

interface BadgeProps {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "accent" | "neutral";
}

const badgeColors: Record<string, string> = {
  primary: "bg-primary-500/15 text-primary-300 ring-primary-500/30",
  success: "bg-success-500/15 text-success-400 ring-success-500/30",
  warning: "bg-warning-500/15 text-warning-400 ring-warning-500/30",
  error: "bg-error-500/15 text-error-400 ring-error-500/30",
  accent: "bg-accent-500/15 text-accent-300 ring-accent-500/30",
  neutral: "bg-white/5 text-slate-300 ring-white/10",
};

export function Badge({ children, color = "neutral" }: BadgeProps) {
  return <span className={cn("chip ring-1", badgeColors[color])}>{children}</span>;
}

interface ScoreRingProps {
  value: number;
  size?: number;
  label?: string;
}

export function ScoreRing({ value, size = 72, label }: ScoreRingProps) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 75 ? "#34d399" : value >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white">{value}</span>
        {label && <span className="text-[9px] uppercase tracking-wider text-slate-400">{label}</span>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, className, color = "from-primary-500 to-accent-500" }: ProgressBarProps) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r", color)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

interface EmptyProps {
  icon: ReactNode;
  title: string;
  message: string;
}

export function Empty({ icon, title, message }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-14 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">{icon}</div>
      <p className="font-medium text-slate-200">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="glass flex items-center gap-4 border-error-500/30 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-500/15 ring-1 ring-error-500/30">
        <span className="text-error-400">!</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Something went wrong</p>
        <p className="mt-0.5 text-xs text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost py-2 text-xs">Retry</button>
      )}
    </div>
  );
}
