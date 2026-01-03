import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Flight, LocationData } from '@/types/flight';
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightMapProps {
  flights: Flight[];
  locations: LocationData[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight | null) => void;
  mapboxToken: string;
}

export function FlightMap({ flights, locations, selectedFlight, onSelectFlight, mapboxToken }: FlightMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const planeMarker = useRef<mapboxgl.Marker | null>(null);

  const initMap = useCallback(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [19.0402, 47.4979], // Budapest
      zoom: 3,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Add heat map layer for popular locations
      map.current?.addSource('locations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: locations.map(loc => ({
            type: 'Feature' as const,
            properties: { count: loc.count },
            geometry: {
              type: 'Point' as const,
              coordinates: [loc.lon, loc.lat],
            },
          })),
        },
      });

      map.current?.addLayer({
        id: 'locations-heat',
        type: 'heatmap',
        source: 'locations',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 0, 0, 10, 1],
          'heatmap-intensity': 0.6,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'hsl(280, 80%, 40%)',
            0.4, 'hsl(325, 90%, 50%)',
            0.6, 'hsl(325, 90%, 60%)',
            0.8, 'hsl(325, 90%, 70%)',
            1, 'hsl(40, 100%, 70%)',
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.7,
        },
      });

      // Add all flight routes
      flights.forEach((flight, index) => {
        const routeId = `route-${index}`;
        
        // Create route line
        const coordinates = flight.routeData.length > 0 
          ? flight.routeData.map(p => [p.lon, p.lat])
          : [[flight.startLon, flight.startLat], [flight.endLon, flight.endLat]];

        map.current?.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.current?.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': 'hsl(325, 90%, 60%)',
            'line-width': 2,
            'line-opacity': 0.4,
          },
        });

        // Click handler for route
        map.current?.on('click', routeId, () => {
          onSelectFlight(flight);
        });

        map.current?.on('mouseenter', routeId, () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current?.on('mouseleave', routeId, () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      });
    });
  }, [mapboxToken, flights, locations, onSelectFlight]);

  useEffect(() => {
    initMap();
    return () => {
      map.current?.remove();
    };
  }, [initMap]);

  // Highlight selected flight
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    flights.forEach((_, index) => {
      const routeId = `route-${index}`;
      try {
        map.current?.setPaintProperty(routeId, 'line-opacity', selectedFlight ? 0.1 : 0.4);
        map.current?.setPaintProperty(routeId, 'line-width', 2);
      } catch (e) {
        // Layer might not exist yet
      }
    });

    if (selectedFlight) {
      const selectedIndex = flights.findIndex(f => f === selectedFlight);
      if (selectedIndex !== -1) {
        const routeId = `route-${selectedIndex}`;
        try {
          map.current?.setPaintProperty(routeId, 'line-opacity', 1);
          map.current?.setPaintProperty(routeId, 'line-width', 4);
        } catch (e) {
          // Layer might not exist
        }

        // Fit to route
        const coordinates = selectedFlight.routeData.length > 0
          ? selectedFlight.routeData.map(p => [p.lon, p.lat] as [number, number])
          : [[selectedFlight.startLon, selectedFlight.startLat], [selectedFlight.endLon, selectedFlight.endLat]] as [number, number][];

        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord as mapboxgl.LngLatLike),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );

        map.current?.fitBounds(bounds, { padding: 100, duration: 1000 });
      }
    }
  }, [selectedFlight, flights]);

  // Animation logic
  const animateFlight = useCallback(() => {
    if (!selectedFlight || !map.current) return;

    const coordinates = selectedFlight.routeData.length > 0
      ? selectedFlight.routeData.map(p => [p.lon, p.lat] as [number, number])
      : [[selectedFlight.startLon, selectedFlight.startLat], [selectedFlight.endLon, selectedFlight.endLat]] as [number, number][];

    const totalPoints = coordinates.length;
    let currentPoint = Math.floor((animationProgress / 100) * (totalPoints - 1));

    const animate = () => {
      if (!isPlaying) return;
      
      currentPoint++;
      if (currentPoint >= totalPoints) {
        setIsPlaying(false);
        setAnimationProgress(100);
        return;
      }

      const progress = (currentPoint / (totalPoints - 1)) * 100;
      setAnimationProgress(progress);

      const coord = coordinates[currentPoint];
      
      if (!planeMarker.current) {
        const el = document.createElement('div');
        el.className = 'plane-marker';
        el.innerHTML = '✈️';
        el.style.fontSize = '24px';
        el.style.transform = 'rotate(-45deg)';
        planeMarker.current = new mapboxgl.Marker(el)
          .setLngLat(coord)
          .addTo(map.current!);
      } else {
        planeMarker.current.setLngLat(coord);
      }

      // Calculate rotation based on direction
      if (currentPoint < totalPoints - 1) {
        const nextCoord = coordinates[currentPoint + 1];
        const angle = Math.atan2(nextCoord[1] - coord[1], nextCoord[0] - coord[0]) * (180 / Math.PI);
        const el = planeMarker.current.getElement();
        el.style.transform = `rotate(${angle - 90}deg)`;
      }

      animationRef.current = requestAnimationFrame(() => {
        setTimeout(animate, 50); // Adjust speed here
      });
    };

    animate();
  }, [selectedFlight, isPlaying, animationProgress]);

  useEffect(() => {
    if (isPlaying) {
      animateFlight();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animateFlight]);

  const handlePlayPause = () => {
    if (animationProgress >= 100) {
      setAnimationProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAnimationProgress(0);
    if (planeMarker.current) {
      planeMarker.current.remove();
      planeMarker.current = null;
    }
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in-delay-1">
      <div className="relative h-[500px]">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map overlay gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/40 to-transparent" />
        
        {/* Legend */}
        <div className="absolute top-4 left-4 glass-card p-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-muted-foreground">Népszerű helyek</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" />
            <span className="text-muted-foreground">Repülési útvonalak</span>
          </div>
        </div>

        {/* Animation controls */}
        {selectedFlight && (
          <div className="absolute bottom-4 left-4 right-4 glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">{selectedFlight.registration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handlePlayPause}
                  className="h-8 w-8 bg-primary hover:bg-primary/90"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${animationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
