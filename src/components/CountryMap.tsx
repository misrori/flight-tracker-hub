import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CountryVisit } from '@/types/flight';
import { Map } from 'lucide-react';

interface CountryMapProps {
  countryVisits: CountryVisit[];
}

// Country center coordinates
const countryCoords: Record<string, [number, number]> = {
  'Magyarország': [47.1625, 19.5033],
  'Németország': [51.1657, 10.4515],
  'Svájc': [46.8182, 8.2275],
  'Egyesült Királyság': [55.3781, -3.4360],
  'Románia': [45.9432, 24.9668],
  'Bulgária': [42.7339, 25.4858],
  'Seychelle-szigetek': [-4.6796, 55.4920],
  'Spanyolország': [40.4637, -3.7492],
  'Olaszország': [41.8719, 12.5674],
  'Franciaország': [46.2276, 2.2137],
  'Ausztria': [47.5162, 14.5501],
  'Horvátország': [45.1, 15.2],
  'Görögország': [39.0742, 21.8243],
  'Hollandia': [52.1326, 5.2913],
  'Belgium': [50.5039, 4.4699],
  'Lengyelország': [51.9194, 19.1451],
  'Csehország': [49.8175, 15.4730],
  'Szlovákia': [48.6690, 19.6990],
  'Szerbia': [44.0165, 21.0059],
  'Szlovénia': [46.1512, 14.9955],
  'Portugália': [39.3999, -8.2245],
  'Törökország': [38.9637, 35.2433],
  'Egyesült Arab Emírségek': [23.4241, 53.8478],
  'Monaco': [43.7384, 7.4246],
  'Montenegró': [42.7087, 19.3744],
  'Albánia': [41.1533, 20.1683],
  'Izland': [64.9631, -19.0208],
  'Norvégia': [60.4720, 8.4689],
  'Svédország': [60.1282, 18.6435],
  'Finnország': [61.9241, 25.7482],
  'Dánia': [56.2639, 9.5018],
  'Luxemburg': [49.8153, 6.1296],
  'Írország': [53.1424, -7.6921],
  'Ciprus': [35.1264, 33.4299],
  'Málta': [35.9375, 14.3754],
  'Szaúd-Arábia': [23.8859, 45.0792],
  'Egyiptom': [26.8206, 30.8025],
  'Marokkó': [31.7917, -7.0926],
  'USA': [37.0902, -95.7129],
  'Kanada': [56.1304, -106.3468],
};

function getColor(visits: number, maxVisits: number): string {
  const intensity = Math.min(visits / maxVisits, 1);
  // From light pink to deep magenta
  const h = 325;
  const s = 70 + intensity * 20;
  const l = 70 - intensity * 40;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function CountryMap({ countryVisits }: CountryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || countryVisits.length === 0) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    const maxVisits = Math.max(...countryVisits.map(c => c.visits));

    countryVisits.forEach(cv => {
      const coords = countryCoords[cv.country];
      if (!coords) return;

      const radius = Math.max(10, Math.min(40, (cv.visits / maxVisits) * 40 + 10));
      const color = getColor(cv.visits, maxVisits);

      const circle = L.circleMarker(coords, {
        radius,
        fillColor: color,
        fillOpacity: 0.7,
        color: 'white',
        weight: 2,
      }).addTo(map);

      circle.bindPopup(`
        <div style="text-align: center; padding: 5px;">
          <strong style="font-size: 14px;">${cv.country}</strong><br/>
          <span style="color: hsl(325, 90%, 60%); font-weight: bold;">${cv.visits}</span> látogatás<br/>
          <small>↑ ${cv.departures} indulás | ↓ ${cv.arrivals} érkezés</small>
        </div>
      `);
    });

    // Fit bounds to show all markers
    const validCoords = countryVisits
      .map(cv => countryCoords[cv.country])
      .filter(Boolean) as [number, number][];
    
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [countryVisits]);

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          Desztinációk térképe
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Buborék mérete = látogatások száma
        </p>
      </div>
      <div ref={mapRef} className="h-[400px] w-full" />
    </div>
  );
}
