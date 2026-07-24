import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ConfirmButton } from '@/components/ConfirmButton';
import { Badge, ButtonLink, Card, EmptyState } from '@/components/ui';
import { brl } from '@/lib/format';

interface Product {
    id: number;
    name: string;
    category: string | null;
    unit_label: string;
    price: number;
    is_active: boolean;
    image_url: string | null;
}

export default function ProductsIndex({ products }: { products: Product[] }) {
    return (
        <AdminLayout title="Produtos">
            <Head title="Produtos" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-stone-800">Produtos</h1>
                <ButtonLink href="/admin/produtos/create">+ Novo produto</ButtonLink>
            </div>

            {products.length === 0 ? (
                <EmptyState title="Nenhum produto" description="Cadastre os produtos da horta para ofertar nos ciclos." />
            ) : (
                <Card>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-5 py-3 font-medium">Produto</th>
                                <th className="px-5 py-3 font-medium">Categoria</th>
                                <th className="px-5 py-3 font-medium">Unidade</th>
                                <th className="px-5 py-3 font-medium">Preço</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-stone-50">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-lg">
                                                {p.image_url ? (
                                                    <img
                                                        src={p.image_url}
                                                        alt={p.name}
                                                        className="h-full w-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    '🥬'
                                                )}
                                            </div>
                                            <span className="font-medium text-stone-800">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-stone-500">{p.category ?? '—'}</td>
                                    <td className="px-5 py-3 text-stone-500">{p.unit_label}</td>
                                    <td className="px-5 py-3 text-stone-700">{brl(p.price)}</td>
                                    <td className="px-5 py-3">
                                        {p.is_active ? <Badge color="green">Ativo</Badge> : <Badge color="stone">Inativo</Badge>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end gap-4">
                                            <Link
                                                href={`/admin/produtos/${p.id}/edit`}
                                                className="text-sm font-medium text-brand-700 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <ConfirmButton
                                                href={`/admin/produtos/${p.id}`}
                                                message={`Remover o produto "${p.name}"?`}
                                            >
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
