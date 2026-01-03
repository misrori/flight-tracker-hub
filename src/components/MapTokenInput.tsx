import { useState } from 'react';
import { Map, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MapTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

export function MapTokenInput({ onTokenSubmit }: MapTokenInputProps) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
      localStorage.setItem('mapbox_token', token.trim());
    }
  };

  return (
    <div className="glass-card p-8 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <Map className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Térkép beállítása</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        A térkép megjelenítéséhez szükség van egy Mapbox public tokenre. 
        Regisztrálj a{' '}
        <a 
          href="https://mapbox.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          mapbox.com
        </a>
        {' '}oldalon és másold be a tokenedet.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="pk.eyJ1Ijo..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          Mentés
        </Button>
      </form>
    </div>
  );
}
