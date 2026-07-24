import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ConfirmButton } from '@/components/ConfirmButton';
import { Badge, ButtonLink, Card, EmptyState } from '@/components/ui';

interface Point {
    id: number;
    name: string;
    address: string | null;
    reference: string | null;
    is_active: boolean;
    cycles_count: number;
}

export default function PointsIndex({ points }: { points: Point[] }) {
    return (
        <AdminLayout title="Pontos de entrega">
            <Head title="Pontos de entrega" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-stone-800">Pontos de entrega</h1>
                <ButtonLink href="/admin/pontos/create">+ Novo ponto</ButtonLink>
            </div>

            {points.length === 0 ? (
                <EmptyState
                    title="Nenhum ponto de entrega"
                    description="Cadastre os locais por onde a rota semanal pode passar."
                />
            ) : (
                <Card>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-5 py-3 font-medium">Nome</th>
                                <th className="px-5 py-3 font-medium">Endereço</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Ciclos</th>
                                <th className="px-5 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {points.map((p) => (
                                <tr key={p.id} className="hover:bg-stone-50">
                                    <td className="px-5 py-3 font-medium text-stone-800">📍 {p.name}</td>
                                    <td className="px-5 py-3 text-stone-500">
                                        {p.address ?? '—'}
                                        {p.reference && <span className="block text-xs text-stone-400">{p.reference}</span>}
                                    </td>
                                    <td className="px-5 py-3">
                                        {p.is_active ? <Badge color="green">Ativo</Badge> : <Badge color="stone">Inativo</Badge>}
                                    </td>
                                    <td className="px-5 py-3 text-stone-500">{p.cycles_count}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end gap-4">
                                            <Link
                                                href={`/admin/pontos/${p.id}/edit`}
                                                className="text-sm font-medium text-brand-700 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <ConfirmButton href={`/admin/pontos/${p.id}`} message={`Remover "${p.name}"?`}>
                                                Remover
                                            </ConfirmButton>
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
