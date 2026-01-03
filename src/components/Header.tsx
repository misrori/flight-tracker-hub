import { Plane, BarChart3, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Áttekintés', icon: Home },
    { href: '/analytics', label: 'Elemzések', icon: BarChart3 },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Plane className="w-8 h-8 text-primary animate-fly" />
            <div className="absolute inset-0 w-8 h-8 bg-primary/30 blur-xl animate-pulse" />
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
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

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
