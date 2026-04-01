import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
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
  badge,
  className,
  iconBgColor = 'bg-primary/10',
  iconBorderColor = 'border-primary/20',
  iconColor = 'text-primary',
  gradientFrom = 'from-primary/20',
  centered = false,
}: PageHeaderProps) {
  return (
    <section className={cn('mb-12 pt-14', centered && 'text-center', className)}>
      <div className="relative mb-8">
        <div className={cn('absolute top-0 right-0 w-[300px] h-[200px] rounded-full blur-[100px] pointer-events-none', gradientFrom)} />
        <div className={cn('flex items-center gap-5', centered && 'justify-center')}>
          <div className={cn('p-4 rounded-2xl border backdrop-blur-xl', iconBgColor, iconBorderColor)}>
            <Icon className={cn('w-8 h-8', iconColor)} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">{title}</h2>
            {subtitle && (
              <p className="text-foreground/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5">{subtitle}</p>
            )}
          </div>
          {badge}
        </div>
      </div>
      <div className={cn('h-px w-full bg-gradient-to-r', gradientFrom, 'via-white/[0.04] to-transparent')} />
    </section>
  );
}
