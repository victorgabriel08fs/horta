import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ButtonLink, Card, EmptyState, StatusBadge } from '@/components/ui';
import { brl, dateBR, qty, timeBR, unitLabel } from '@/lib/format';
import { CycleSummary } from '@/types';

interface Props {
    cycle: CycleSummary | null;
    stats: { products: number; active_cycles: number; reservations: number; expected_amount: number };
    topProducts: { product_name: string; unit: string; quantity: number }[];
    byPoint: {
        point_name: string;
        scheduled_at: string | null;
        reservations_count: number;
        total: number;
    }[];
    recentReservations: {
        id: number;
        customer_name: string;
        delivery_point_name: string;
        status: string;
        status_label: string;
        total_amount: number;
        confirmation_code: string;
    }[];
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <Card className="p-5">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-stone-800">{value}</p>
        </Card>
    );
}

export default function Dashboard({ cycle, stats, topProducts, byPoint, recentReservations }: Props) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            {cycle ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 p-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-stone-800">{cycle.title ?? 'Ciclo atual'}</h2>
                            <StatusBadge status={cycle.status} label={cycle.status_label} />
                        </div>
                        <p className="text-sm text-stone-600">Entrega em {dateBR(cycle.delivery_date)}</p>
                    </div>
                    <div className="flex gap-2">
                        <ButtonLink href={`/admin/ciclos/${cycle.id}/reservas`} variant="outline" size="sm">
                            Reservas
                        </ButtonLink>
                        <ButtonLink href={`/admin/ciclos/${cycle.id}/separacao`} size="sm">
                            Lista de separação
                        </ButtonLink>
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <EmptyState
                        title="Nenhum ciclo cadastrado"
                        description="Crie o primeiro ciclo de entrega para começar a receber reservas."
                        action={<ButtonLink href="/admin/ciclos/create">Criar ciclo</ButtonLink>}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Reservas no ciclo" value={stats.reservations} />
                <Stat label="Valor previsto" value={brl(stats.expected_amount)} />
                <Stat label="Produtos cadastrados" value={stats.products} />
                <Stat label="Ciclos abertos" value={stats.active_cycles} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                    <h3 className="mb-3 font-semibold text-stone-800">Mais reservados</h3>
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-stone-400">Sem reservas ainda.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {topProducts.slice(0, 8).map((p, i) => (
                                <li key={i} className="flex justify-between">
                                    <span className="text-stone-600">{p.product_name}</span>
                                    <span className="font-medium text-stone-800">
                                        {qty(p.quantity)} {unitLabel(p.unit)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="p-5">
                    <h3 className="mb-3 font-semibold text-stone-800">Reservas por ponto</h3>
                    {byPoint.length === 0 ? (
                        <p className="text-sm text-stone-400">Sem reservas ainda.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {byPoint.map((p, i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <span className="text-stone-600">
                                        📍 {p.point_name}
                                        {p.scheduled_at && (
                                            <span className="text-stone-400"> · ~{timeBR(p.scheduled_at)}</span>
                                        )}
                                    </span>
                                    <span className="font-medium text-stone-800">
                                        {p.reservations_count} · {brl(p.total)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <Card className="mt-6">
                <div className="border-b border-stone-100 px-5 py-3">
                    <h3 className="font-semibold text-stone-800">Reservas recentes</h3>
                </div>
                {recentReservations.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-stone-400">Nenhuma reserva ainda.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-5 py-2 font-medium">Código</th>
                                <th className="px-5 py-2 font-medium">Cliente</th>
                                <th className="px-5 py-2 font-medium">Ponto</th>
                                <th className="px-5 py-2 font-medium">Status</th>
                                <th className="px-5 py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {recentReservations.map((r) => (
                                <tr key={r.id} className="hover:bg-stone-50">
                                    <td className="px-5 py-2.5 font-mono text-brand-700">{r.confirmation_code}</td>
                                    <td className="px-5 py-2.5 text-stone-700">{r.customer_name}</td>
                                    <td className="px-5 py-2.5 text-stone-500">{r.delivery_point_name}</td>
                                    <td className="px-5 py-2.5">
                                        <StatusBadge status={r.status} label={r.status_label} />
                                    </td>
                                    <td className="px-5 py-2.5 text-right font-medium text-stone-800">
                                        {brl(r.total_amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </AdminLayout>
    );
}
