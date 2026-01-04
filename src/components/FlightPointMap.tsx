import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Flight } from '@/types/flight';
import { LocateFixed } from 'lucide-react';

interface FlightPointMapProps {
    flights: Flight[];
}

export function FlightPointMap({ flights }: FlightPointMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [48, 15],
            zoom: 4,
            zoomControl: true,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markersRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        const markers = markersRef.current;
        if (!map || !markers || flights.length === 0) return;

        // Clear existing markers
        markers.clearLayers();

        // Use a subset of flights if there are too many to avoid performance issues
        const displayFlights = flights.slice(0, 500);

        const latLngs: L.LatLngExpression[] = [];

        displayFlights.forEach((flight) => {
            // Start Marker
            const startMarker = L.circleMarker([flight.startLat, flight.startLon], {
                radius: 4,
                fillColor: '#22c55e', // Green for start
                fillOpacity: 0.8,
                color: 'white',
                weight: 1,
            });

            startMarker.bindPopup(`
        <div style="padding: 5px;">
          <strong>Indulás: ${flight.startCity || flight.startCountry}</strong><br/>
          <span>Járat: ${flight.registration}</span><br/>
          <span>Dátum: ${flight.date.toLocaleDateString('hu-HU')}</span>
        </div>
      `);
            markers.addLayer(startMarker);
            latLngs.push([flight.startLat, flight.startLon]);

            // End Marker
            const endMarker = L.circleMarker([flight.endLat, flight.endLon], {
                radius: 4,
                fillColor: '#ef4444', // Red for end
                fillOpacity: 0.8,
                color: 'white',
                weight: 1,
            });

            endMarker.bindPopup(`
        <div style="padding: 5px;">
          <strong>Érkezés: ${flight.endCity || flight.endCountry}</strong><br/>
          <span>Járat: ${flight.registration}</span><br/>
          <span>Dátum: ${flight.date.toLocaleDateString('hu-HU')}</span>
        </div>
      `);
            markers.addLayer(endMarker);
            latLngs.push([flight.endLat, flight.endLon]);
        });

        // Fit bounds to show markers
        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [flights]);

    return (
        <div className="glass-card shadow-lg rounded-xl overflow-hidden animate-fade-in border border-white/10">
            <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-white/90">
                        <LocateFixed className="w-5 h-5 text-primary" />
                        Járat pontok
                    </h3>
                    <p className="text-sm text-white/50 mt-1">
                        Indulási (<span className="text-green-400">●</span>) és érkezési (<span className="text-red-400">●</span>) helyszínek
                    </p>
                </div>
            </div>
            <div ref={mapRef} className="h-[400px] w-full" />
        </div>
    );
}
