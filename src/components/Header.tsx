import { Plane } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Plane className="w-8 h-8 text-primary animate-fly" />
            <div className="absolute inset-0 w-8 h-8 bg-primary/30 blur-xl animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient">NER</span>
              <span className="text-foreground">Lines</span>
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Flight Tracker & Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Élő adatok</span>
          </div>
        </div>
      </div>
    </header>
  );
}
