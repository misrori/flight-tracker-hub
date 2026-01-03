// Simple reverse geocoding based on coordinates
// Maps approximate lat/lon ranges to countries

interface CountryBounds {
  name: string;
  code: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const COUNTRIES: CountryBounds[] = [
  { name: 'Magyarország', code: 'HU', minLat: 45.7, maxLat: 48.6, minLon: 16.1, maxLon: 22.9 },
  { name: 'Ausztria', code: 'AT', minLat: 46.4, maxLat: 49.0, minLon: 9.5, maxLon: 17.2 },
  { name: 'Németország', code: 'DE', minLat: 47.3, maxLat: 55.1, minLon: 5.9, maxLon: 15.0 },
  { name: 'Svájc', code: 'CH', minLat: 45.8, maxLat: 47.8, minLon: 6.0, maxLon: 10.5 },
  { name: 'Franciaország', code: 'FR', minLat: 41.3, maxLat: 51.1, minLon: -5.1, maxLon: 9.6 },
  { name: 'Olaszország', code: 'IT', minLat: 36.6, maxLat: 47.1, minLon: 6.6, maxLon: 18.5 },
  { name: 'Spanyolország', code: 'ES', minLat: 35.9, maxLat: 43.8, minLon: -9.3, maxLon: 4.3 },
  { name: 'Egyesült Királyság', code: 'GB', minLat: 49.9, maxLat: 60.8, minLon: -8.2, maxLon: 1.8 },
  { name: 'Horvátország', code: 'HR', minLat: 42.4, maxLat: 46.5, minLon: 13.5, maxLon: 19.4 },
  { name: 'Szerbia', code: 'RS', minLat: 42.2, maxLat: 46.2, minLon: 18.8, maxLon: 23.0 },
  { name: 'Románia', code: 'RO', minLat: 43.6, maxLat: 48.3, minLon: 20.3, maxLon: 29.7 },
  { name: 'Ukrajna', code: 'UA', minLat: 44.4, maxLat: 52.4, minLon: 22.1, maxLon: 40.2 },
  { name: 'Lengyelország', code: 'PL', minLat: 49.0, maxLat: 54.8, minLon: 14.1, maxLon: 24.2 },
  { name: 'Csehország', code: 'CZ', minLat: 48.6, maxLat: 51.1, minLon: 12.1, maxLon: 18.9 },
  { name: 'Szlovákia', code: 'SK', minLat: 47.7, maxLat: 49.6, minLon: 16.8, maxLon: 22.6 },
  { name: 'Szlovénia', code: 'SI', minLat: 45.4, maxLat: 46.9, minLon: 13.4, maxLon: 16.6 },
  { name: 'Görögország', code: 'GR', minLat: 34.8, maxLat: 41.7, minLon: 19.4, maxLon: 29.6 },
  { name: 'Törökország', code: 'TR', minLat: 36.0, maxLat: 42.1, minLon: 26.0, maxLon: 44.8 },
  { name: 'Oroszország', code: 'RU', minLat: 41.2, maxLat: 81.9, minLon: 19.6, maxLon: 180.0 },
  { name: 'Norvégia', code: 'NO', minLat: 58.0, maxLat: 71.2, minLon: 4.6, maxLon: 31.1 },
  { name: 'Svédország', code: 'SE', minLat: 55.3, maxLat: 69.1, minLon: 11.1, maxLon: 24.2 },
  { name: 'Finnország', code: 'FI', minLat: 59.8, maxLat: 70.1, minLon: 20.6, maxLon: 31.6 },
  { name: 'Dánia', code: 'DK', minLat: 54.6, maxLat: 57.8, minLon: 8.1, maxLon: 15.2 },
  { name: 'Hollandia', code: 'NL', minLat: 50.8, maxLat: 53.5, minLon: 3.4, maxLon: 7.2 },
  { name: 'Belgium', code: 'BE', minLat: 49.5, maxLat: 51.5, minLon: 2.5, maxLon: 6.4 },
  { name: 'Portugália', code: 'PT', minLat: 36.9, maxLat: 42.2, minLon: -9.5, maxLon: -6.2 },
  { name: 'Írország', code: 'IE', minLat: 51.4, maxLat: 55.4, minLon: -10.5, maxLon: -6.0 },
  { name: 'Izland', code: 'IS', minLat: 63.4, maxLat: 66.5, minLon: -24.5, maxLon: -13.5 },
  { name: 'USA', code: 'US', minLat: 24.5, maxLat: 49.4, minLon: -125.0, maxLon: -66.9 },
  { name: 'Kanada', code: 'CA', minLat: 41.7, maxLat: 83.1, minLon: -141.0, maxLon: -52.6 },
  { name: 'Mexikó', code: 'MX', minLat: 14.5, maxLat: 32.7, minLon: -118.4, maxLon: -86.7 },
  { name: 'Egyesült Arab Emírségek', code: 'AE', minLat: 22.6, maxLat: 26.1, minLon: 51.5, maxLon: 56.4 },
  { name: 'Szaúd-Arábia', code: 'SA', minLat: 16.4, maxLat: 32.2, minLon: 34.6, maxLon: 55.7 },
  { name: 'Izrael', code: 'IL', minLat: 29.5, maxLat: 33.3, minLon: 34.3, maxLon: 35.9 },
  { name: 'Egyiptom', code: 'EG', minLat: 22.0, maxLat: 31.7, minLon: 24.7, maxLon: 36.9 },
  { name: 'Marokkó', code: 'MA', minLat: 27.7, maxLat: 35.9, minLon: -13.2, maxLon: -1.0 },
  { name: 'Dél-Afrika', code: 'ZA', minLat: -34.8, maxLat: -22.1, minLon: 16.5, maxLon: 32.9 },
  { name: 'Japán', code: 'JP', minLat: 24.0, maxLat: 45.5, minLon: 123.0, maxLon: 146.0 },
  { name: 'Kína', code: 'CN', minLat: 18.2, maxLat: 53.6, minLon: 73.5, maxLon: 134.8 },
  { name: 'India', code: 'IN', minLat: 6.7, maxLat: 35.5, minLon: 68.2, maxLon: 97.4 },
  { name: 'Ausztrália', code: 'AU', minLat: -43.6, maxLat: -10.7, minLon: 113.2, maxLon: 153.6 },
  { name: 'Brazília', code: 'BR', minLat: -33.8, maxLat: 5.3, minLon: -73.9, maxLon: -34.8 },
  { name: 'Argentína', code: 'AR', minLat: -55.1, maxLat: -21.8, minLon: -73.6, maxLon: -53.6 },
  { name: 'Monaco', code: 'MC', minLat: 43.72, maxLat: 43.75, minLon: 7.41, maxLon: 7.44 },
  { name: 'Montenegró', code: 'ME', minLat: 41.9, maxLat: 43.6, minLon: 18.5, maxLon: 20.4 },
  { name: 'Albánia', code: 'AL', minLat: 39.6, maxLat: 42.7, minLon: 19.3, maxLon: 21.1 },
  { name: 'Bulgária', code: 'BG', minLat: 41.2, maxLat: 44.2, minLon: 22.4, maxLon: 28.6 },
  { name: 'Ciprus', code: 'CY', minLat: 34.6, maxLat: 35.7, minLon: 32.3, maxLon: 34.6 },
  { name: 'Málta', code: 'MT', minLat: 35.8, maxLat: 36.1, minLon: 14.2, maxLon: 14.6 },
];

export function getCountryFromCoords(lat: number, lon: number): { name: string; code: string } {
  for (const country of COUNTRIES) {
    if (
      lat >= country.minLat &&
      lat <= country.maxLat &&
      lon >= country.minLon &&
      lon <= country.maxLon
    ) {
      return { name: country.name, code: country.code };
    }
  }
  return { name: 'Ismeretlen', code: 'XX' };
}

export function getCountryStats(flights: { startLat: number; startLon: number; endLat: number; endLon: number }[]): Map<string, { name: string; code: string; visits: number; asStart: number; asEnd: number }> {
  const stats = new Map<string, { name: string; code: string; visits: number; asStart: number; asEnd: number }>();

  flights.forEach(flight => {
    const startCountry = getCountryFromCoords(flight.startLat, flight.startLon);
    const endCountry = getCountryFromCoords(flight.endLat, flight.endLon);

    // Update start country
    const startStats = stats.get(startCountry.code) || { name: startCountry.name, code: startCountry.code, visits: 0, asStart: 0, asEnd: 0 };
    startStats.visits++;
    startStats.asStart++;
    stats.set(startCountry.code, startStats);

    // Update end country (if different)
    if (endCountry.code !== startCountry.code) {
      const endStats = stats.get(endCountry.code) || { name: endCountry.name, code: endCountry.code, visits: 0, asStart: 0, asEnd: 0 };
      endStats.visits++;
      endStats.asEnd++;
      stats.set(endCountry.code, endStats);
    }
  });

  return stats;
}

// Country flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
