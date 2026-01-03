import { Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  view: 'daily' | 'monthly';
  onViewChange: (view: 'daily' | 'monthly') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={view === 'daily' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('daily')}
        className={view === 'daily' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Napi
      </Button>
      <Button
        variant={view === 'monthly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('monthly')}
        className={view === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
      >
        <CalendarDays className="w-4 h-4 mr-2" />
        Havi
      </Button>
    </div>
  );
}
