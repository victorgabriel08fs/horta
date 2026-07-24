import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface MapPoint {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    address?: string | null;
    scheduled_at?: string | null;
}

interface Props {
    points: MapPoint[];
    height?: number;
    activeId?: number | null;
    onSelect?: (id: number) => void;
    className?: string;
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function pinHtml(index: number, active: boolean): string {
    const bg = active ? '#15803d' : '#16a34a';
    const size = active ? 34 : 28;
    return `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#fff;font-weight:700;font-size:13px;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4);">${index + 1}</div>`;
}

export function PointsMap({ points, height = 220, activeId = null, onSelect, className }: Props) {
    const withCoords = points.filter((p) => p.latitude != null && p.longitude != null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layerRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!containerRef.current || withCoords.length === 0) return;

        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current, {
                scrollWheelZoom: false,
                zoomControl: true,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap',
            }).addTo(mapRef.current);
            layerRef.current = L.layerGroup().addTo(mapRef.current);
        }

        const layer = layerRef.current!;
        layer.clearLayers();
        const latlngs: L.LatLngExpression[] = [];

        withCoords.forEach((p, i) => {
            const active = p.id === activeId;
            const marker = L.marker([p.latitude as number, p.longitude as number], {
                icon: L.divIcon({ className: 'horta-pin', html: pinHtml(i, active), iconSize: [28, 28], iconAnchor: [14, 28] }),
                zIndexOffset: active ? 1000 : 0,
            }).addTo(layer);

            const dir = `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
            marker.bindPopup(
                `<div style="font-size:13px;line-height:1.4"><strong>${escapeHtml(p.name)}</strong>` +
                    (p.address ? `<br>${escapeHtml(p.address)}` : '') +
                    `<br><a href="${dir}" target="_blank" rel="noopener" style="color:#16a34a;font-weight:600">Como chegar →</a></div>`,
            );

            if (onSelect) marker.on('click', () => onSelect(p.id));
            latlngs.push([p.latitude as number, p.longitude as number]);
        });

        if (latlngs.length === 1) {
            mapRef.current.setView(latlngs[0], 15);
        } else {
            mapRef.current.fitBounds(L.latLngBounds(latlngs).pad(0.25));
        }

        const timer = setTimeout(() => mapRef.current?.invalidateSize(), 60);
        return () => clearTimeout(timer);
    }, [points, activeId, onSelect, withCoords.length]);

    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    if (withCoords.length === 0) {
        return (
            <div className={cn('rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500', className)}>
                <p className="font-medium text-stone-600">📍 Localização dos pontos</p>
                <ul className="mt-2 space-y-1">
                    {points.map((p) => (
                        <li key={p.id}>
                            <a
                                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(p.address ?? p.name)}`}
                                target="_blank"
                                rel="noopener"
                                className="text-brand-700 hover:underline"
                            >
                                {p.name} — ver no mapa
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{ height }}
            className={cn('isolate z-0 overflow-hidden rounded-xl border border-stone-200', className)}
        />
    );
}
