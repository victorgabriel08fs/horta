import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ButtonLink, Card, EmptyState, StatusBadge } from '@/components/ui';
import { dateBR } from '@/lib/format';

interface Cycle {
    id: number;
    title: string | null;
    delivery_date: string;
    status: string;
    status_label: string;
    reservations_count: number;
    products_count: number;
    points_count: number;
}

export default function CyclesIndex({ cycles }: { cycles: Cycle[] }) {
    return (
        <AdminLayout title="Ciclos de entrega">
            <Head title="Ciclos de entrega" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-stone-800">Ciclos de entrega</h1>
                <ButtonLink href="/admin/ciclos/create">+ Novo ciclo</ButtonLink>
            </div>

            {cycles.length === 0 ? (
                <EmptyState
                    title="Nenhum ciclo criado"
                    description="Crie um ciclo semanal com produtos, quantidades e pontos de entrega."
                    action={<ButtonLink href="/admin/ciclos/create">Criar ciclo</ButtonLink>}
                />
            ) : (
                <Card>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-5 py-3 font-medium">Ciclo</th>
                                <th className="px-5 py-3 font-medium">Entrega</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Produtos</th>
                                <th className="px-5 py-3 font-medium">Pontos</th>
                                <th className="px-5 py-3 font-medium">Reservas</th>
                                <th className="px-5 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {cycles.map((c) => (
                                <tr key={c.id} className="hover:bg-stone-50">
                                    <td className="px-5 py-3 font-medium text-stone-800">
                                        <Link href={`/admin/ciclos/${c.id}`} className="hover:text-brand-700">
                                            {c.title ?? `Ciclo #${c.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3 text-stone-500">{dateBR(c.delivery_date)}</td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={c.status} label={c.status_label} />
                                    </td>
                                    <td className="px-5 py-3 text-stone-500">{c.products_count}</td>
                                    <td className="px-5 py-3 text-stone-500">{c.points_count}</td>
                                    <td className="px-5 py-3 text-stone-500">{c.reservations_count}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end gap-4">
                                            <Link
                                                href={`/admin/ciclos/${c.id}`}
                                                className="text-sm font-medium text-brand-700 hover:underline"
                                            >
                                                Abrir
                                            </Link>
                                            <Link
                                                href={`/admin/ciclos/${c.id}/edit`}
                                                className="text-sm font-medium text-stone-500 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </AdminLayout>
    );
}
