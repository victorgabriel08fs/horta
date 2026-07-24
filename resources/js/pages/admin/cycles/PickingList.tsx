import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, ButtonLink, Card, EmptyState } from '@/components/ui';
import { brl, dateBR, qty, timeBR, unitLabel } from '@/lib/format';
import { CycleSummary } from '@/types';

interface ItemLine {
    product_name: string;
    unit: string;
    quantity: number;
}
interface Props {
    cycle: CycleSummary;
    picking: {
        byProduct: ItemLine[];
        byPoint: {
            point_name: string;
            scheduled_at: string | null;
            reservations_count: number;
            total: number;
            items: ItemLine[];
        }[];
        byCustomer: {
            name: string;
            point_name: string;
            confirmation_code: string;
            total: number;
            items: ItemLine[];
        }[];
        totals: { reservations: number; amount: number };
    };
}

export default function PickingList({ cycle, picking }: Props) {
    const empty = picking.totals.reservations === 0;

    return (
        <AdminLayout title="Lista de separação">
            <Head title="Lista de separação" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-stone-800">Lista de separação</h1>
                    <p className="text-sm text-stone-500">
                        {cycle.title ?? `Ciclo #${cycle.id}`} · entrega {dateBR(cycle.delivery_date)} ·{' '}
                        {picking.totals.reservations} reservas · {brl(picking.totals.amount)}
                    </p>
                </div>
                <div className="flex gap-2 print:hidden">
                    <ButtonLink href={`/admin/ciclos/${cycle.id}`} variant="outline" size="sm">
                        ← Voltar
                    </ButtonLink>
                    <Button size="sm" onClick={() => window.print()}>
                        🖨 Imprimir
                    </Button>
                </div>
            </div>

            {empty ? (
                <EmptyState title="Sem reservas ativas" description="Esta lista será preenchida conforme os clientes reservarem." />
            ) : (
                <div className="space-y-6">
                    {/* Total geral por produto */}
                    <Card className="p-6">
                        <h2 className="mb-3 font-bold text-stone-800">Total geral por produto (colheita)</h2>
                        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                            {picking.byProduct.map((item, i) => (
                                <div key={i} className="flex justify-between border-b border-dashed border-stone-100 py-1">
                                    <span className="text-stone-700">{item.product_name}</span>
                                    <span className="font-semibold text-stone-900">
                                        {qty(item.quantity)} {unitLabel(item.unit)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Por ponto de entrega */}
                    <div>
                        <h2 className="mb-3 font-bold text-stone-800">Caixas por ponto de entrega</h2>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {picking.byPoint.map((point, i) => (
                                <Card key={i} className="p-5">
                                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                        <h3 className="font-semibold text-stone-800">📍 {point.point_name}</h3>
                                        <span className="text-sm text-stone-500">
                                            {point.scheduled_at && `~${timeBR(point.scheduled_at)} · `}
                                            {point.reservations_count} reservas
                                        </span>
                                    </div>
                                    <ul className="mt-3 space-y-1 text-sm">
                                        {point.items.map((item, j) => (
                                            <li key={j} className="flex justify-between">
                                                <span className="text-stone-600">{item.product_name}</span>
                                                <span className="font-medium text-stone-800">
                                                    {qty(item.quantity)} {unitLabel(item.unit)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-3 border-t border-stone-100 pt-2 text-right text-sm font-semibold text-brand-700">
                                        {brl(point.total)}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Por cliente */}
                    <Card className="p-6">
                        <h2 className="mb-3 font-bold text-stone-800">Por cliente</h2>
                        <div className="space-y-3">
                            {picking.byCustomer.map((customer, i) => (
                                <div key={i} className="rounded-lg border border-stone-100 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-stone-800">
                                            {customer.name}{' '}
                                            <span className="font-mono text-xs text-stone-400">
                                                {customer.confirmation_code}
                                            </span>
                                        </span>
                                        <span className="text-sm text-stone-500">📍 {customer.point_name}</span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-stone-600">
                                        {customer.items.map((item, j) => (
                                            <span key={j}>
                                                {qty(item.quantity)} {unitLabel(item.unit)} {item.product_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
}
