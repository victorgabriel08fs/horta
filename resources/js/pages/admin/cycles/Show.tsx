import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, ButtonLink, Card, StatusBadge } from '@/components/ui';
import { brl, dateBR, dateTimeBR, qty, timeBR } from '@/lib/format';
import { CatalogProduct, CyclePoint, CycleSummary } from '@/types';

interface Props {
    cycle: CycleSummary;
    notes: string | null;
    products: CatalogProduct[];
    points: CyclePoint[];
}

export default function CycleShow({ cycle, notes, products, points }: Props) {
    const act = (path: string) => router.post(`/admin/ciclos/${cycle.id}/${path}`, {}, { preserveScroll: true });

    return (
        <AdminLayout title={cycle.title ?? `Ciclo #${cycle.id}`}>
            <Head title={cycle.title ?? 'Ciclo'} />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-stone-800">{cycle.title ?? `Ciclo #${cycle.id}`}</h1>
                    <StatusBadge status={cycle.status} label={cycle.status_label} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <ButtonLink href={`/admin/ciclos/${cycle.id}/edit`} variant="outline" size="sm">
                        Editar
                    </ButtonLink>
                    <ButtonLink href={`/admin/ciclos/${cycle.id}/reservas`} variant="outline" size="sm">
                        Reservas
                    </ButtonLink>
                    <ButtonLink href={`/admin/ciclos/${cycle.id}/separacao`} variant="outline" size="sm">
                        Lista de separação
                    </ButtonLink>
                    {cycle.status === 'draft' && (
                        <Button size="sm" onClick={() => act('abrir')}>
                            Abrir ciclo
                        </Button>
                    )}
                    {cycle.status === 'open' && (
                        <Button size="sm" variant="secondary" onClick={() => act('fechar')}>
                            Fechar pedidos
                        </Button>
                    )}
                    {cycle.status === 'closed' && (
                        <Button size="sm" onClick={() => act('entregar')}>
                            Marcar entregue
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-5">
                    <p className="text-sm text-stone-500">Entrega</p>
                    <p className="mt-1 font-semibold text-stone-800">{dateBR(cycle.delivery_date)}</p>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-stone-500">Janela de pedidos</p>
                    <p className="mt-1 text-sm text-stone-700">
                        {dateTimeBR(cycle.order_opens_at)}
                        <br />
                        até {dateTimeBR(cycle.order_closes_at)}
                    </p>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-stone-500">Aceitando reservas?</p>
                    <p className="mt-1 font-semibold text-stone-800">{cycle.is_ordering_open ? 'Sim' : 'Não'}</p>
                </Card>
            </div>

            {notes && <p className="mt-4 rounded-lg bg-stone-100 p-3 text-sm text-stone-600">{notes}</p>}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <div className="border-b border-stone-100 px-5 py-3">
                        <h3 className="font-semibold text-stone-800">Produtos ({products.length})</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-5 py-2 font-medium">Produto</th>
                                <th className="px-5 py-2 font-medium">Preço</th>
                                <th className="px-5 py-2 text-right font-medium">Restante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {products.map((p) => (
                                <tr key={p.cycle_product_id}>
                                    <td className="px-5 py-2 text-stone-700">{p.name}</td>
                                    <td className="px-5 py-2 text-stone-500">{brl(p.price)}</td>
                                    <td className="px-5 py-2 text-right text-stone-700">
                                        {qty(p.remaining)} / {qty(p.quantity_available)} {p.unit_label}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                <Card>
                    <div className="border-b border-stone-100 px-5 py-3">
                        <h3 className="font-semibold text-stone-800">Pontos de entrega ({points.length})</h3>
                    </div>
                    <ul className="divide-y divide-stone-100">
                        {points.map((p) => (
                            <li key={p.id} className="px-5 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-stone-800">📍 {p.name}</span>
                                    {p.scheduled_at && (
                                        <span className="text-sm text-stone-500">~{timeBR(p.scheduled_at)}</span>
                                    )}
                                </div>
                                {p.address && <p className="text-sm text-stone-500">{p.address}</p>}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </AdminLayout>
    );
}
