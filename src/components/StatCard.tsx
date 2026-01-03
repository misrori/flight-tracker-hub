import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <div 
      className="glass-card p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {title}
          </p>
          <p className="stat-value mt-2">{value}</p>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
