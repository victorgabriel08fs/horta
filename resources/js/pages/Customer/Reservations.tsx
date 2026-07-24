import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ButtonLink, Card, EmptyState, StatusBadge } from '@/components/ui';
import { brl, dateBR, qty, timeBR } from '@/lib/format';

interface ReservationRow {
    id: number;
    confirmation_code: string;
    status: string;
    status_label: string;
    delivery_point_name: string;
    delivery_date: string;
    scheduled_at: string | null;
    total_amount: number;
    can_cancel: boolean;
    items_count: number;
    items: { product_name: string; unit_label: string; quantity: number; line_total: number }[];
}

export default function Reservations({ reservations }: { reservations: ReservationRow[] }) {
    const cancel = (r: ReservationRow) => {
        if (window.confirm('Deseja realmente cancelar esta reserva?')) {
            router.delete(`/reservas/${r.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Minhas reservas" />

            <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="text-2xl font-bold text-stone-800">Minhas reservas</h1>

                {reservations.length === 0 ? (
                    <EmptyState
                        title="Você ainda não tem reservas"
                        description="Confira o catálogo e reserve os produtos da próxima entrega."
                        action={<ButtonLink href="/">Ver o catálogo</ButtonLink>}
                    />
                ) : (
                    reservations.map((r) => (
                        <Card key={r.id} className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-brand-700">
                                            {r.confirmation_code}
                                        </span>
                                        <StatusBadge status={r.status} label={r.status_label} />
                                    </div>
                                    <p className="mt-1 text-sm text-stone-600">
                                        📍 {r.delivery_point_name} · entrega {dateBR(r.delivery_date)}
                                        {r.scheduled_at && ` ~${timeBR(r.scheduled_at)}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-stone-800">{brl(r.total_amount)}</p>
                                    <p className="text-xs text-stone-400">{r.items_count} itens</p>
                                </div>
                            </div>

                            <ul className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm text-stone-600">
                                {r.items.map((item, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span>
                                            {qty(item.quantity)} {item.unit_label} · {item.product_name}
                                        </span>
                                        <span>{brl(item.line_total)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 flex items-center justify-end gap-3">
                                <Link
                                    href={`/reservas/${r.id}/confirmacao`}
                                    className="text-sm font-medium text-stone-500 hover:text-stone-700"
                                >
                                    Ver detalhes
                                </Link>
                                {r.can_cancel && (
                                    <button
                                        onClick={() => cancel(r)}
                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
