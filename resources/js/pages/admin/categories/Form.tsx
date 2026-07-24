import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, ButtonLink, Card, Field, Input } from '@/components/ui';

interface Category {
    id: number;
    name: string;
    slug: string;
    position: number | null;
}

export default function CategoryForm({ category }: { category: Category | null }) {
    const editing = Boolean(category);
    const form = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        position: category?.position ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/admin/categorias/${category!.id}`);
        } else {
            form.post('/admin/categorias');
        }
    };

    return (
        <AdminLayout title={editing ? 'Editar categoria' : 'Nova categoria'}>
            <Head title={editing ? 'Editar categoria' : 'Nova categoria'} />

            <div className="mx-auto max-w-xl">
                <Card className="p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Nome" required error={form.errors.name}>
                            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoFocus />
                        </Field>
                        <Field label="Slug" hint="Deixe em branco para gerar automaticamente." error={form.errors.slug}>
                            <Input value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
                        </Field>
                        <Field label="Posição (ordenação)" error={form.errors.position}>
                            <Input
                                type="number"
                                value={form.data.position}
                                onChange={(e) => form.setData('position', e.target.value)}
                            />
                        </Field>
                        <div className="flex justify-end gap-3 pt-2">
                            <ButtonLink href="/admin/categorias" variant="outline">
                                Cancelar
                            </ButtonLink>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Salvar' : 'Criar'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AdminLayout>
    );
}
