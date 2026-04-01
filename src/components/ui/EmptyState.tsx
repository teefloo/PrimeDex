import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[2rem] max-w-2xl mx-auto border-dashed border border-white/[0.06]',
        className
      )}
    >
      <div className="p-6 bg-white/[0.03] rounded-full mb-6">
        <Icon className="w-16 h-16 text-foreground/20" />
      </div>
      <h3 className="text-2xl font-black mb-2 text-foreground/70 tracking-tight">{title}</h3>
      <p className="text-sm text-foreground/40 font-medium mb-8 text-center px-6 max-w-md">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <button className="glass-btn px-8 py-4 flex items-center gap-2 hover:scale-105 transition-all">
            <span className="font-black uppercase tracking-[0.15em] text-sm">{actionLabel}</span>
          </button>
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="glass-btn px-8 py-4 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span className="font-black uppercase tracking-[0.15em] text-sm">{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
}
