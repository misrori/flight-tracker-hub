import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Flight } from '@/types/flight';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface FlightDetailMapProps {
  flight: Flight;
}

// Custom plane icon
const planeIcon = L.divIcon({
  html: `<div style="font-size: 24px; transform: rotate(-45deg);">✈️</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  className: 'plane-icon',
});

function AnimatedPlane({ 
  coordinates, 
  isPlaying, 
  progress, 
  onProgressChange,
  speed 
}: { 
  coordinates: [number, number][]; 
  isPlaying: boolean; 
  progress: number;
  onProgressChange: (p: number) => void;
  speed: number;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (coordinates.length < 2) return;

    const totalPoints = coordinates.length;
    const currentIndex = Math.floor((progressRef.current / 100) * (totalPoints - 1));
    const currentPos = coordinates[Math.min(currentIndex, totalPoints - 1)];

    if (!markerRef.current) {
      markerRef.current = L.marker(currentPos, { icon: planeIcon }).addTo(map);
    }

    const animate = () => {
      if (!isPlaying) return;

      const newProgress = progressRef.current + (0.5 * speed);
      if (newProgress >= 100) {
        onProgressChange(100);
        return;
      }

      onProgressChange(newProgress);
      const idx = Math.floor((newProgress / 100) * (totalPoints - 1));
      const pos = coordinates[Math.min(idx, totalPoints - 1)];
      
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);

        // Calculate rotation
        if (idx < totalPoints - 1) {
          const nextPos = coordinates[idx + 1];
          const angle = Math.atan2(nextPos[0] - pos[0], nextPos[1] - pos[1]) * (180 / Math.PI);
          const el = markerRef.current.getElement();
          if (el) {
            el.style.transformOrigin = 'center';
            el.style.transform = `rotate(${-angle + 45}deg)`;
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, coordinates, map, speed, onProgressChange]);

  // Update marker position when progress changes manually
  useEffect(() => {
    if (!markerRef.current || coordinates.length < 2) return;
    
    const totalPoints = coordinates.length;
    const idx = Math.floor((progress / 100) * (totalPoints - 1));
    const pos = coordinates[Math.min(idx, totalPoints - 1)];
    markerRef.current.setLatLng(pos);
  }, [progress, coordinates]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  return null;
}

function FitToRoute({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
}

export function FlightDetailMap({ flight }: FlightDetailMapProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  const coordinates: [number, number][] = flight.routeData.length > 0
    ? flight.routeData.map(p => [p.lat, p.lon])
    : [[flight.startLat, flight.startLon], [flight.endLat, flight.endLon]];

  // Create trail based on progress
  const trailCoords = coordinates.slice(0, Math.floor((progress / 100) * coordinates.length) + 1);

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

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative h-[600px]">
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitToRoute coordinates={coordinates} />
          
          {/* Full route (faded) */}
          <Polyline
            positions={coordinates}
            pathOptions={{
              color: '#e91e9e',
              weight: 2,
              opacity: 0.3,
              dashArray: '5, 10',
            }}
          />

          {/* Animated trail */}
          <Polyline
            positions={trailCoords}
            pathOptions={{
              color: '#e91e9e',
              weight: 4,
              opacity: 1,
            }}
          />

          {/* Start marker */}
          <Marker 
            position={[flight.startLat, flight.startLon]}
            icon={L.divIcon({
              html: `<div style="background: #22c55e; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
              className: '',
            })}
          />

          {/* End marker */}
          <Marker 
            position={[flight.endLat, flight.endLon]}
            icon={L.divIcon({
              html: `<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
              className: '',
            })}
          />

          <AnimatedPlane 
            coordinates={coordinates}
            isPlaying={isPlaying}
            progress={progress}
            onProgressChange={setProgress}
            speed={speed}
          />
        </MapContainer>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 glass-card p-4 z-[1000]">
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

        {/* Legend */}
        <div className="absolute top-4 left-4 glass-card p-3 text-sm z-[1000]">
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
    </div>
  );
}
