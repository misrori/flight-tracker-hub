import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { loadFlightData, formatDuration, formatCurrency, estimateFlightCost, calculateDistance } from '@/lib/flightData';
import { getCountryFromCoords, getFlagEmoji } from '@/lib/countries';
import type { Flight } from '@/types/flight';
import { Loader2, ArrowLeft, Plane, Clock, Route, DollarSign, MapPin, Calendar, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const FlightDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    loadFlightData()
      .then(data => {
        setAllFlights(data);
        const flightIndex = parseInt(id || '0', 10);
        if (data[flightIndex]) {
          setFlight(data[flightIndex]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load flight data:', err);
        setLoading(false);
      });
  }, [id]);

  // Animation effect
  useEffect(() => {
    if (!isPlaying || !flight) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + (0.5 * speed);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed, flight]);

  const coordinates = useMemo(() => {
    if (!flight) return [];
    return flight.routeData.length > 0
      ? flight.routeData.map(p => ({ lat: p.lat, lon: p.lon }))
      : [
          { lat: flight.startLat, lon: flight.startLon },
          { lat: flight.endLat, lon: flight.endLon }
        ];
  }, [flight]);

  const currentPosition = useMemo(() => {
    if (coordinates.length === 0) return null;
    const idx = Math.floor((progress / 100) * (coordinates.length - 1));
    return coordinates[Math.min(idx, coordinates.length - 1)];
  }, [coordinates, progress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Járat betöltése...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Járat nem található</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vissza a főoldalra
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const startCountry = getCountryFromCoords(flight.startLat, flight.startLon);
  const endCountry = getCountryFromCoords(flight.endLat, flight.endLon);
  const distance = calculateDistance(flight.startLat, flight.startLon, flight.endLat, flight.endLon);
  const cost = estimateFlightCost(flight.durationMinutes);
  const flightIndex = parseInt(id || '0', 10);

  const handlePlayPause = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 2, 4];
    const currentIdx = speeds.indexOf(speed);
    setSpeed(speeds[(currentIdx + 1) % speeds.length]);
  };

  // Calculate SVG path for route visualization
  const svgPath = useMemo(() => {
    if (coordinates.length < 2) return '';
    
    // Simple projection
    const minLat = Math.min(...coordinates.map(c => c.lat));
    const maxLat = Math.max(...coordinates.map(c => c.lat));
    const minLon = Math.min(...coordinates.map(c => c.lon));
    const maxLon = Math.max(...coordinates.map(c => c.lon));
    
    const padding = 40;
    const width = 800;
    const height = 400;
    
    const scaleX = (lon: number) => padding + ((lon - minLon) / (maxLon - minLon || 1)) * (width - 2 * padding);
    const scaleY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding);
    
    const points = coordinates.map((c, i) => {
      const x = scaleX(c.lon);
      const y = scaleY(c.lat);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return points.join(' ');
  }, [coordinates]);

  const currentSvgPoint = useMemo(() => {
    if (!currentPosition || coordinates.length < 2) return null;
    
    const minLat = Math.min(...coordinates.map(c => c.lat));
    const maxLat = Math.max(...coordinates.map(c => c.lat));
    const minLon = Math.min(...coordinates.map(c => c.lon));
    const maxLon = Math.max(...coordinates.map(c => c.lon));
    
    const padding = 40;
    const width = 800;
    const height = 400;
    
    const x = padding + ((currentPosition.lon - minLon) / (maxLon - minLon || 1)) * (width - 2 * padding);
    const y = height - padding - ((currentPosition.lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding);
    
    return { x, y };
  }, [currentPosition, coordinates]);

  const trailPath = useMemo(() => {
    if (coordinates.length < 2) return '';
    
    const idx = Math.floor((progress / 100) * (coordinates.length - 1));
    const trailCoords = coordinates.slice(0, idx + 1);
    
    if (trailCoords.length < 2) return '';
    
    const minLat = Math.min(...coordinates.map(c => c.lat));
    const maxLat = Math.max(...coordinates.map(c => c.lat));
    const minLon = Math.min(...coordinates.map(c => c.lon));
    const maxLon = Math.max(...coordinates.map(c => c.lon));
    
    const padding = 40;
    const width = 800;
    const height = 400;
    
    const scaleX = (lon: number) => padding + ((lon - minLon) / (maxLon - minLon || 1)) * (width - 2 * padding);
    const scaleY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding);
    
    const points = trailCoords.map((c, i) => {
      const x = scaleX(c.lon);
      const y = scaleY(c.lat);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return points.join(' ');
  }, [coordinates, progress]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Vissza az áttekintéshez
        </Link>

        {/* Flight header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Plane className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold font-mono">{flight.registration}</h1>
            </div>
            <p className="text-muted-foreground">
              {flight.type} • {flight.operator}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {flightIndex > 0 && (
              <Link to={`/flight/${flightIndex - 1}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Előző
                </Button>
              </Link>
            )}
            {flightIndex < allFlights.length - 1 && (
              <Link to={`/flight/${flightIndex + 1}`}>
                <Button variant="outline" size="sm">
                  Következő
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Route info */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Start */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Indulás</span>
              </div>
              <div className="flex items-center gap-2 text-2xl">
                <span>{getFlagEmoji(startCountry.code)}</span>
                <span className="font-semibold">{startCountry.name}</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {flight.startLat.toFixed(4)}°, {flight.startLon.toFixed(4)}°
              </p>
            </div>

            {/* Arrow & Distance */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-green-500 to-primary" />
                <Plane className="w-6 h-6 text-primary" />
                <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-primary to-red-500" />
              </div>
              <span className="font-mono text-lg text-primary">{Math.round(distance)} km</span>
            </div>

            {/* End */}
            <div className="text-center md:text-right">
              <div className="flex items-center gap-2 justify-center md:justify-end mb-2">
                <span className="text-sm text-muted-foreground">Érkezés</span>
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
              <div className="flex items-center gap-2 text-2xl justify-center md:justify-end">
                <span className="font-semibold">{endCountry.name}</span>
                <span>{getFlagEmoji(endCountry.code)}</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {flight.endLat.toFixed(4)}°, {flight.endLon.toFixed(4)}°
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Dátum
            </div>
            <p className="font-mono text-lg">
              {flight.startTime.toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="w-4 h-4" />
              Időtartam
            </div>
            <p className="font-mono text-lg text-primary">{formatDuration(flight.durationMinutes)}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Route className="w-4 h-4" />
              Adatpontok
            </div>
            <p className="font-mono text-lg">{flight.pointsCount}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              Becsült költség
            </div>
            <p className="font-mono text-lg text-accent">{formatCurrency(cost)}</p>
          </div>
        </div>

        {/* Animated route visualization */}
        <div className="glass-card mb-8 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold">Útvonal animáció</h2>
          </div>
          
          {/* SVG Route visualization */}
          <div className="relative bg-card">
            <svg viewBox="0 0 800 400" className="w-full h-auto">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220, 20%, 18%)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Full route (faded) */}
              <path
                d={svgPath}
                fill="none"
                stroke="hsl(325, 90%, 60%)"
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="5,5"
              />
              
              {/* Animated trail */}
              <path
                d={trailPath}
                fill="none"
                stroke="hsl(325, 90%, 60%)"
                strokeWidth="3"
                strokeOpacity="1"
                style={{ filter: 'drop-shadow(0 0 4px hsl(325, 90%, 60%))' }}
              />
              
              {/* Start point */}
              {coordinates.length > 0 && (
                <circle
                  cx={40 + ((coordinates[0].lon - Math.min(...coordinates.map(c => c.lon))) / (Math.max(...coordinates.map(c => c.lon)) - Math.min(...coordinates.map(c => c.lon)) || 1)) * 720}
                  cy={400 - 40 - ((coordinates[0].lat - Math.min(...coordinates.map(c => c.lat))) / (Math.max(...coordinates.map(c => c.lat)) - Math.min(...coordinates.map(c => c.lat)) || 1)) * 320}
                  r="8"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
              
              {/* End point */}
              {coordinates.length > 1 && (
                <circle
                  cx={40 + ((coordinates[coordinates.length - 1].lon - Math.min(...coordinates.map(c => c.lon))) / (Math.max(...coordinates.map(c => c.lon)) - Math.min(...coordinates.map(c => c.lon)) || 1)) * 720}
                  cy={400 - 40 - ((coordinates[coordinates.length - 1].lat - Math.min(...coordinates.map(c => c.lat))) / (Math.max(...coordinates.map(c => c.lat)) - Math.min(...coordinates.map(c => c.lat)) || 1)) * 320}
                  r="8"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
              
              {/* Current position (plane) */}
              {currentSvgPoint && (
                <g transform={`translate(${currentSvgPoint.x}, ${currentSvgPoint.y})`}>
                  <circle r="12" fill="hsl(325, 90%, 60%)" opacity="0.3" />
                  <text 
                    fontSize="20" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                    style={{ filter: 'drop-shadow(0 0 2px black)' }}
                  >
                    ✈️
                  </text>
                </g>
              )}
            </svg>

            {/* Legend */}
            <div className="absolute top-4 left-4 glass-card p-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Indulás</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Érkezés</span>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-10 w-10"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handlePlayPause}
                  className="h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSpeedChange}
                  className="h-10 w-10"
                >
                  <span className="text-xs font-mono">{speed}x</span>
                </Button>
              </div>
              
              <div className="flex-1">
                <Slider
                  value={[progress]}
                  onValueChange={([val]) => {
                    setIsPlaying(false);
                    setProgress(val);
                  }}
                  max={100}
                  step={0.5}
                  className="w-full"
                />
              </div>
              
              <span className="text-sm font-mono text-muted-foreground w-16 text-right">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Time info */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Időadatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Indulás időpontja</p>
              <p className="font-mono">
                {flight.startTime.toLocaleString('hu-HU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Érkezés időpontja</p>
              <p className="font-mono">
                {flight.endTime.toLocaleString('hu-HU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlightDetail;
