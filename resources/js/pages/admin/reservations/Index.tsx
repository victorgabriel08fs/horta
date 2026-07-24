import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ButtonLink, Card, EmptyState, Select, StatusBadge } from '@/components/ui';
import { brl, dateBR, qty } from '@/lib/format';
import { CyclePoint, CycleSummary } from '@/types';

interface ReservationRow {
    id: number;
    customer_name: string;
    is_guest: boolean;
    contact: string | null;
    delivery_point_name: string;
    cycle_delivery_point_id: number;
    status: string;
    status_label: string;
    total_amount: number;
    confirmation_code: string;
    notes: string | null;
    items: { product_name: string; unit_label: string; quantity: number; line_total: number }[];
}

interface Props {
    cycle: CycleSummary;
    points: CyclePoint[];
    reservations: ReservationRow[];
    filters: { point_id: number | null };
}

const statusOptions = [
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelada' },
];

export default function ReservationsIndex({ cycle, points, reservations, filters }: Props) {
    const filterByPoint = (pointId: string) => {
        router.get(
            `/admin/ciclos/${cycle.id}/reservas`,
            pointId ? { point_id: pointId } : {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const changeStatus = (id: number, status: string) => {
        router.patch(`/admin/reservas/${id}/status`, { status }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Reservas do ciclo">
            <Head title="Reservas" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-stone-800">{cycle.title ?? `Ciclo #${cycle.id}`}</h1>
                    <p className="text-sm text-stone-500">Entrega {dateBR(cycle.delivery_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-500">Ponto:</span>
                    <Select
                        className="w-56"
                        value={filters.point_id ?? ''}
                        onChange={(e) => filterByPoint(e.target.value)}
                    >
                        <option value="">Todos os pontos</option>
                        {points.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </Select>
                    <ButtonLink href={`/admin/ciclos/${cycle.id}`} variant="outline" size="sm">
                        ← Voltar
                    </ButtonLink>
                </div>
            </div>

            {reservations.length === 0 ? (
                <EmptyState title="Nenhuma reserva" description="Não há reservas para o filtro selecionado." />
            ) : (
                <div className="space-y-3">
                    {reservations.map((r) => (
                        <Card key={r.id} className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-brand-700">
                                            {r.confirmation_code}
                                        </span>
                                        <StatusBadge status={r.status} label={r.status_label} />
                                        {r.is_guest && <span className="text-xs text-stone-400">convidado</span>}
                                    </div>
                                    <p className="mt-1 text-sm text-stone-700">
                                        {r.customer_name}
                                        {r.contact && <span className="text-stone-400"> · {r.contact}</span>}
                                    </p>
                                    <p className="text-sm text-stone-500">📍 {r.delivery_point_name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-stone-800">{brl(r.total_amount)}</span>
                                    <Select
                                        className="w-40"
                                        value={r.status}
                                        onChange={(e) => changeStatus(r.id, e.target.value)}
                                    >
                                        {statusOptions.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-100 pt-2 text-sm text-stone-600">
                                {r.items.map((item, i) => (
                                    <li key={i}>
                                        {qty(item.quantity)} {item.unit_label} · {item.product_name}
                                    </li>
                                ))}
                            </ul>
                            {r.notes && <p className="mt-2 text-sm italic text-stone-500">“{r.notes}”</p>}
                        </Card>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
