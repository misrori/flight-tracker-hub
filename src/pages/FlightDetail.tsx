import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { loadFlightData, formatDuration, formatCurrency, estimateFlightCost, calculateDistance } from '@/lib/flightData';
import type { Flight } from '@/types/flight';
import { Loader2, ArrowLeft, Plane, Clock, Route, DollarSign, Calendar, ArrowRight, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const countryFlags: Record<string, string> = {
  'Magyarország': '🇭🇺',
  'Németország': '🇩🇪',
  'Svájc': '🇨🇭',
  'Egyesült Királyság': '🇬🇧',
  'Románia': '🇷🇴',
  'Bulgária': '🇧🇬',
  'Seychelle-szigetek': '🇸🇨',
  'Spanyolország': '🇪🇸',
  'Olaszország': '🇮🇹',
  'Franciaország': '🇫🇷',
  'Ausztria': '🇦🇹',
  'Horvátország': '🇭🇷',
  'Görögország': '🇬🇷',
  'Hollandia': '🇳🇱',
  'Belgium': '🇧🇪',
  'Lengyelország': '🇵🇱',
  'Csehország': '🇨🇿',
  'Szlovákia': '🇸🇰',
  'Szerbia': '🇷🇸',
  'Szlovénia': '🇸🇮',
  'Portugália': '🇵🇹',
  'Törökország': '🇹🇷',
  'Egyesült Arab Emírségek': '🇦🇪',
  'Monaco': '🇲🇨',
  // English names from CSV
  'Hungary': '🇭🇺',
  'Germany': '🇩🇪',
  'Switzerland': '🇨🇭',
  'United Kingdom': '🇬🇧',
  'Romania': '🇷🇴',
  'Bulgaria': '🇧🇬',
  'Seychelles': '🇸🇨',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'France': '🇫🇷',
  'Austria': '🇦🇹',
  'Croatia': '🇭🇷',
  'Greece': '🇬🇷',
  'Netherlands': '🇳🇱',
  'Poland': '🇵🇱',
  'Czechia': '🇨🇿',
  'Slovakia': '🇸🇰',
  'Serbia': '🇷🇸',
  'Portugal': '🇵🇹',
  'Türkiye': '🇹🇷',
  'USA': '🇺🇸',
  'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Maldives': '🇲🇻',
  'South Africa': '🇿🇦',
  'Tanzania': '🇹🇿',
  'Armenia': '🇦🇲',
  'China': '🇨🇳',
  'Hong Kong': '🇭🇰',
  'Philippines': '🇵🇭',
  'Vietnam': '🇻🇳',
  'Viet Nam': '🇻🇳',
  'Taiwan': '🇹🇼',
  'Malta': '🇲🇹',
  'Iceland': '🇮🇸',
  'Albania': '🇦🇱',
};

function getFlag(country: string): string {
  return countryFlags[country] || '🏳️';
}

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

  // Simple 2-point route (start to end)
  const coordinates = useMemo(() => {
    if (!flight) return [];
    return [
      { lat: flight.startLat, lon: flight.startLon },
      { lat: flight.endLat, lon: flight.endLon }
    ];
  }, [flight]);

  const currentPosition = useMemo(() => {
    if (coordinates.length < 2) return null;
    const t = progress / 100;
    return {
      lat: coordinates[0].lat + t * (coordinates[1].lat - coordinates[0].lat),
      lon: coordinates[0].lon + t * (coordinates[1].lon - coordinates[0].lon),
    };
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
    const padding = 60;
    const width = 800;
    const height = 400;

    const minLon = Math.min(coordinates[0].lon, coordinates[1].lon) - 2;
    const maxLon = Math.max(coordinates[0].lon, coordinates[1].lon) + 2;
    const minLat = Math.min(coordinates[0].lat, coordinates[1].lat) - 2;
    const maxLat = Math.max(coordinates[0].lat, coordinates[1].lat) + 2;

    const scaleX = (lon: number) => padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
    const scaleY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

    const x1 = scaleX(coordinates[0].lon);
    const y1 = scaleY(coordinates[0].lat);
    const x2 = scaleX(coordinates[1].lon);
    const y2 = scaleY(coordinates[1].lat);

    // Arc path for curved route
    const midX = (x1 + x2) / 2;
    const midY = Math.min(y1, y2) - 50;

    return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  }, [coordinates]);

  const currentSvgPoint = useMemo(() => {
    if (!currentPosition || coordinates.length < 2) return null;

    const padding = 60;
    const width = 800;
    const height = 400;

    const minLon = Math.min(coordinates[0].lon, coordinates[1].lon) - 2;
    const maxLon = Math.max(coordinates[0].lon, coordinates[1].lon) + 2;
    const minLat = Math.min(coordinates[0].lat, coordinates[1].lat) - 2;
    const maxLat = Math.max(coordinates[0].lat, coordinates[1].lat) + 2;

    const scaleX = (lon: number) => padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
    const scaleY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

    // Quadratic bezier point calculation
    const t = progress / 100;
    const x1 = scaleX(coordinates[0].lon);
    const y1 = scaleY(coordinates[0].lat);
    const x2 = scaleX(coordinates[1].lon);
    const y2 = scaleY(coordinates[1].lat);
    const midX = (x1 + x2) / 2;
    const midY = Math.min(y1, y2) - 50;

    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

    return { x, y };
  }, [currentPosition, coordinates, progress]);

  const startPoint = useMemo(() => {
    if (coordinates.length < 2) return null;
    const padding = 60;
    const width = 800;
    const height = 400;

    const minLon = Math.min(coordinates[0].lon, coordinates[1].lon) - 2;
    const maxLon = Math.max(coordinates[0].lon, coordinates[1].lon) + 2;
    const minLat = Math.min(coordinates[0].lat, coordinates[1].lat) - 2;
    const maxLat = Math.max(coordinates[0].lat, coordinates[1].lat) + 2;

    const x = padding + ((coordinates[0].lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
    const y = height - padding - ((coordinates[0].lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

    return { x, y };
  }, [coordinates]);

  const endPoint = useMemo(() => {
    if (coordinates.length < 2) return null;
    const padding = 60;
    const width = 800;
    const height = 400;

    const minLon = Math.min(coordinates[0].lon, coordinates[1].lon) - 2;
    const maxLon = Math.max(coordinates[0].lon, coordinates[1].lon) + 2;
    const minLat = Math.min(coordinates[0].lat, coordinates[1].lat) - 2;
    const maxLat = Math.max(coordinates[0].lat, coordinates[1].lat) + 2;

    const x = padding + ((coordinates[1].lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
    const y = height - padding - ((coordinates[1].lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

    return { x, y };
  }, [coordinates]);

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
              {flight.type} {flight.operator && `• ${flight.operator}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://globe.adsbexchange.com/?icao=${flight.icao}&lat=${flight.startLat}&lon=${flight.startLon}&zoom=5&showTrace=${flight.date.toISOString().split('T')[0]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
                <ExternalLink className="w-4 h-4 mr-2" />
                Megnyitás ADSBExchange-en
              </Button>
            </a>
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
                <span>{getFlag(flight.startCountry)}</span>
                <div>
                  <span className="font-semibold">{flight.startCity || 'Ismeretlen'}</span>
                  <p className="text-sm text-muted-foreground">{flight.startCountry}</p>
                </div>
              </div>
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
                <div className="text-right">
                  <span className="font-semibold">{flight.endCity || 'Ismeretlen'}</span>
                  <p className="text-sm text-muted-foreground">{flight.endCountry}</p>
                </div>
                <span>{getFlag(flight.endCountry)}</span>
              </div>
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
              {flight.date.toLocaleDateString('hu-HU', {
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
              Indulás/Érkezés
            </div>
            <p className="font-mono text-sm">{flight.startTime} - {flight.endTime}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              Kalkulált költség
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
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220, 20%, 18%)" strokeWidth="0.5" />
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
                strokeDasharray="10,5"
              />

              {/* Animated trail */}
              <path
                d={svgPath}
                fill="none"
                stroke="hsl(325, 90%, 60%)"
                strokeWidth="3"
                strokeDasharray={`${progress * 5} 1000`}
                style={{ filter: 'drop-shadow(0 0 4px hsl(325, 90%, 60%))' }}
              />

              {/* Start point with label */}
              {startPoint && (
                <g>
                  <circle cx={startPoint.x} cy={startPoint.y} r="10" fill="#22c55e" stroke="white" strokeWidth="2" />
                  <text x={startPoint.x} y={startPoint.y + 30} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    {flight.startCity || flight.startCountry}
                  </text>
                </g>
              )}

              {/* End point with label */}
              {endPoint && (
                <g>
                  <circle cx={endPoint.x} cy={endPoint.y} r="10" fill="#ef4444" stroke="white" strokeWidth="2" />
                  <text x={endPoint.x} y={endPoint.y + 30} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    {flight.endCity || flight.endCountry}
                  </text>
                </g>
              )}

              {/* Current position (plane) */}
              {currentSvgPoint && (
                <g transform={`translate(${currentSvgPoint.x}, ${currentSvgPoint.y})`}>
                  <circle r="15" fill="hsl(325, 90%, 60%)" opacity="0.3" />
                  <text
                    fontSize="24"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ filter: 'drop-shadow(0 0 2px black)' }}
                  >
                    ✈️
                  </text>
                </g>
              )}
            </svg>
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

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>NERLines - Repülési adatok elemzése és vizualizációja</p>
        </footer>
      </main>
    </div>
  );
};

export default FlightDetail;
