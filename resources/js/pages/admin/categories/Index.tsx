import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ConfirmButton } from '@/components/ConfirmButton';
import { ButtonLink, Card, EmptyState } from '@/components/ui';

interface Category {
    id: number;
    name: string;
    slug: string;
    position: number | null;
    products_count: number;
}

export default function CategoriesIndex({ categories }: { categories: Category[] }) {
    return (
        <AdminLayout title="Categorias">
            <Head title="Categorias" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-stone-800">Categorias</h1>
                <ButtonLink href="/admin/categorias/create">+ Nova categoria</ButtonLink>
            </div>

            {categories.length === 0 ? (
                <EmptyState title="Nenhuma categoria" description="Crie categorias para organizar o catálogo." />
            ) : (
                <Card>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-5 py-3 font-medium">Nome</th>
                                <th className="px-5 py-3 font-medium">Slug</th>
                                <th className="px-5 py-3 font-medium">Posição</th>
                                <th className="px-5 py-3 font-medium">Produtos</th>
                                <th className="px-5 py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {categories.map((c) => (
                                <tr key={c.id} className="hover:bg-stone-50">
                                    <td className="px-5 py-3 font-medium text-stone-800">{c.name}</td>
                                    <td className="px-5 py-3 font-mono text-stone-500">{c.slug}</td>
                                    <td className="px-5 py-3 text-stone-500">{c.position ?? '—'}</td>
                                    <td className="px-5 py-3 text-stone-500">{c.products_count}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end gap-4">
                                            <Link
                                                href={`/admin/categorias/${c.id}/edit`}
                                                className="text-sm font-medium text-brand-700 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <ConfirmButton
                                                href={`/admin/categorias/${c.id}`}
                                                message={`Remover a categoria "${c.name}"?`}
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
