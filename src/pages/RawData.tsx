import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { loadFlightData, formatDuration, formatCurrency } from '@/lib/flightData';
import type { Flight } from '@/types/flight';
import {
    Loader2,
    Search,
    Download,
    ArrowUpDown,
    Plane,
    Calendar,
    Clock,
    MapPin,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type SortConfig = {
    key: keyof Flight | 'distance';
    direction: 'asc' | 'desc';
} | null;

const RawData = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortConfig>({ key: 'date', direction: 'desc' });

    useEffect(() => {
        loadFlightData()
            .then(data => {
                setFlights(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load flight data:', err);
                setLoading(false);
            });
    }, []);

    const handleSort = (key: keyof Flight | 'distance') => {
        setSort(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'desc' };
        });
    };

    const filteredAndSortedFlights = useMemo(() => {
        const result = flights.filter(f =>
            f.registration.toLowerCase().includes(search.toLowerCase()) ||
            f.type.toLowerCase().includes(search.toLowerCase()) ||
            f.startCity.toLowerCase().includes(search.toLowerCase()) ||
            f.endCity.toLowerCase().includes(search.toLowerCase()) ||
            f.owner.toLowerCase().includes(search.toLowerCase())
        );

        if (sort) {
            result.sort((a, b) => {
                let valA: any = a[sort.key as keyof Flight];
                let valB: any = b[sort.key as keyof Flight];

                if (sort.key === 'date') {
                    valA = a.date.getTime();
                    valB = b.date.getTime();
                }

                if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [flights, search, sort]);

    const downloadCSV = () => {
        const headers = ['Dátum', 'Lajstrom', 'Típus', 'Tulajdonos', 'Indulás', 'Érkezés', 'Időtartam', 'ICAO'];
        const rows = filteredAndSortedFlights.map(f => [
            f.date.toISOString().split('T')[0],
            f.registration,
            f.type,
            f.owner,
            `${f.startCity}, ${f.startCountry}`,
            `${f.endCity}, ${f.endCountry}`,
            formatDuration(f.durationMinutes),
            f.icao
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `repulesi_adatok_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Teljes repülési adatbázis</h1>
                        <p className="text-muted-foreground">Összesen {filteredAndSortedFlights.length} járat található</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Keresés..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button onClick={downloadCSV} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            CSV letöltése
                        </Button>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-2">
                                            Dátum <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('registration')}>
                                        <div className="flex items-center gap-2">
                                            Gép <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Típus</TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('owner')}>
                                        <div className="flex items-center gap-2">
                                            Tulajdonos <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Indulás</TableHead>
                                    <TableHead>Érkezés</TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('durationMinutes')}>
                                        <div className="flex items-center justify-end gap-2">
                                            Hossz <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">ADSB</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedFlights.map((f, i) => (
                                    <TableRow key={`${f.id}-${i}`}>
                                        <TableCell className="font-mono text-sm">
                                            {f.date.toLocaleDateString('hu-HU')}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-primary font-bold">{f.registration}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{f.type}</TableCell>
                                        <TableCell className="text-sm">{f.owner}</TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span>{f.startCity}</span>
                                                <span className="text-[10px] text-muted-foreground">{f.startCountry}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span>{f.endCity}</span>
                                                <span className="text-[10px] text-muted-foreground">{f.endCountry}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">{formatDuration(f.durationMinutes)}</TableCell>
                                        <TableCell className="text-right">
                                            <a
                                                href={`https://globe.adsbexchange.com/?icao=${f.icao}&lat=${f.startLat}&lon=${f.startLon}&zoom=5&showTrace=${f.date.toISOString().split('T')[0]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-primary/80"
                                            >
                                                <ExternalLink className="w-4 h-4 ml-auto" />
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </main>
        </div>
    );
};

export default RawData;
