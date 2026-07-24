import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

interface Props {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
    height?: number;
}

const round7 = (v: number) => Math.round(v * 1e7) / 1e7;

const pinIcon = L.divIcon({
    className: 'horta-pin',
    html: '<div style="width:26px;height:26px;border-radius:9999px;background:#16a34a;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4)"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
});

export function LocationPicker({ latitude, longitude, onChange, height = 260 }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const place = (lat: number, lng: number) => {
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else if (mapRef.current) {
            markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapRef.current);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;
        const hasCoords = latitude != null && longitude != null;
        const start: L.LatLngExpression = hasCoords ? [latitude as number, longitude as number] : [-23.55, -46.63];

        const map = L.map(containerRef.current).setView(start, hasCoords ? 15 : 12);
        mapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        if (hasCoords) place(latitude as number, longitude as number);

        map.on('click', (e: L.LeafletMouseEvent) => {
            const lat = round7(e.latlng.lat);
            const lng = round7(e.latlng.lng);
            place(lat, lng);
            onChangeRef.current(lat, lng);
        });

        const timer = setTimeout(() => map.invalidateSize(), 60);
        return () => {
            clearTimeout(timer);
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sincroniza o marcador quando lat/lng mudam via inputs manuais.
    useEffect(() => {
        if (latitude != null && longitude != null && mapRef.current) {
            place(latitude, longitude);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latitude, longitude]);

    return (
        <div>
            <div
                ref={containerRef}
                style={{ height }}
                className="isolate z-0 overflow-hidden rounded-xl border border-stone-200"
            />
            <p className="mt-1 text-xs text-stone-400">Toque no mapa para marcar a localização do ponto.</p>
        </div>
    );
}
