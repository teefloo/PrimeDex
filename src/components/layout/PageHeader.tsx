import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  badge?: React.ReactNode;
  className?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  iconColor?: string;
  gradientFrom?: string;
  centered?: boolean;
}

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  eyebrow,
  description,
  badge,
  className,
  iconBgColor = 'bg-primary/10',
  iconBorderColor = 'border-primary/20',
  iconColor = 'text-primary',
  gradientFrom = 'from-primary/20',
  centered = false,
}: PageHeaderProps) {
  const resolvedEyebrow = eyebrow ?? 'PrimeDex';
  const resolvedDescription = description ?? subtitle;

  return (
    <section className={cn('page-shell pt-14 mb-10', centered && 'text-center', className)}>
      <div className="page-surface relative overflow-hidden px-5 py-6 md:px-8 md:py-7 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)]">
        <div className={cn('absolute top-0 right-0 h-48 w-48 rounded-full blur-[90px] pointer-events-none opacity-60', gradientFrom)} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className={cn('flex items-start gap-4 md:items-center', centered && 'justify-center')}>
          <div className={cn('flex h-14 w-14 flex-none items-center justify-center rounded-[1.25rem] border backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]', iconBgColor, iconBorderColor)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
          <div className={cn('min-w-0 space-y-2', centered && 'max-w-3xl')}>
            <div className="space-y-1">
              <p className="page-eyebrow">{resolvedEyebrow}</p>
              <h2 className="page-title text-4xl md:text-5xl lg:text-6xl">{title}</h2>
            </div>
            {resolvedDescription && (
              <p className="page-subtitle max-w-2xl">{resolvedDescription}</p>
            )}
          </div>
          {badge && <div className="ml-auto flex-none">{badge}</div>}
        </div>
      </div>
      <div className="page-divider mt-4" />
    </section>
  );
}
