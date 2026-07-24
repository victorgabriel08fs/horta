import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button, ButtonLink, Card, StatusBadge } from '@/components/ui';
import { brl, dateLongBR, qty, timeBR } from '@/lib/format';
import { ReservationView } from '@/types';

interface Props {
    reservation: ReservationView;
    can_cancel: boolean;
}

export default function Confirmation({ reservation, can_cancel }: Props) {
    const cancel = () => {
        if (window.confirm('Deseja realmente cancelar esta reserva?')) {
            router.delete(`/reservas/${reservation.id}`, {
                data: { confirmation_code: reservation.confirmation_code },
                preserveScroll: true,
            });
        }
    };

    const cancelled = reservation.status === 'cancelled';

    return (
        <AppLayout>
            <Head title="Reserva confirmada" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">
                        {cancelled ? '🚫' : '✅'}
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-stone-800">
                        {cancelled ? 'Reserva cancelada' : 'Reserva confirmada!'}
                    </h1>
                    <p className="mt-1 text-stone-500">
                        {cancelled
                            ? 'Esta reserva foi cancelada e o estoque foi devolvido.'
                            : 'Guarde seu código para consultar ou cancelar a reserva depois.'}
                    </p>
                </div>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-stone-400">Código da reserva</p>
                            <p className="font-mono text-2xl font-bold tracking-widest text-brand-700">
                                {reservation.confirmation_code}
                            </p>
                        </div>
                        <StatusBadge status={reservation.status} label={reservation.status_label} />
                    </div>

                    <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-stone-400">Cliente</dt>
                            <dd className="text-stone-800">{reservation.customer_name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-stone-400">Entrega</dt>
                            <dd className="capitalize text-stone-800">{dateLongBR(reservation.delivery_date)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-xs uppercase tracking-wide text-stone-400">Ponto de retirada</dt>
                            <dd className="text-stone-800">
                                📍 {reservation.delivery_point_name}
                                {reservation.scheduled_at && (
                                    <span className="text-stone-500"> · chega ~{timeBR(reservation.scheduled_at)}</span>
                                )}
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-6 border-t border-stone-200 pt-4">
                        <p className="mb-2 text-sm font-semibold text-stone-700">Itens</p>
                        <ul className="space-y-1.5 text-sm">
                            {reservation.items.map((item, i) => (
                                <li key={i} className="flex justify-between gap-2">
                                    <span className="text-stone-600">
                                        {qty(item.quantity)} {item.unit_label} · {item.product_name}
                                    </span>
                                    <span className="font-medium text-stone-800">{brl(item.line_total)}</span>
                                </li>
                            ))}
                        </ul>
                        {reservation.notes && (
                            <p className="mt-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
                                <strong>Obs.:</strong> {reservation.notes}
                            </p>
                        )}
                        <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                            <span className="text-stone-500">Total a pagar na entrega</span>
                            <span className="text-xl font-bold text-brand-700">{brl(reservation.total_amount)}</span>
                        </div>
                    </div>
                </Card>

                <div className="flex items-center justify-between">
                    <ButtonLink href="/" variant="outline">
                        ← Voltar ao catálogo
                    </ButtonLink>
                    {can_cancel && (
                        <Button variant="danger" onClick={cancel}>
                            Cancelar reserva
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
