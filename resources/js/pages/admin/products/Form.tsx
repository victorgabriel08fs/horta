import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, ButtonLink, Card, Field, Input, Select, Textarea } from '@/components/ui';

interface Product {
    id: number;
    name: string;
    slug: string;
    category_id: number | null;
    description: string | null;
    unit: string;
    price: number;
    is_active: boolean;
    image_url: string | null;
}

interface Props {
    product: Product | null;
    categories: { id: number; name: string }[];
    units: { value: string; label: string }[];
}

export default function ProductForm({ product, categories, units }: Props) {
    const editing = Boolean(product);
    const form = useForm<{
        name: string;
        slug: string;
        category_id: string | number;
        description: string;
        unit: string;
        price: string | number;
        is_active: boolean;
        image: File | null;
    }>({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        category_id: product?.category_id ?? '',
        description: product?.description ?? '',
        unit: product?.unit ?? units[0]?.value ?? 'unidade',
        price: product?.price ?? '',
        is_active: product?.is_active ?? true,
        image: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const opts = { forceFormData: true };
        if (editing) {
            form.transform((d) => ({ ...d, _method: 'put' }));
            form.post(`/admin/produtos/${product!.id}`, opts);
        } else {
            form.post('/admin/produtos', opts);
        }
    };

    return (
        <AdminLayout title={editing ? 'Editar produto' : 'Novo produto'}>
            <Head title={editing ? 'Editar produto' : 'Novo produto'} />

            <div className="mx-auto max-w-2xl">
                <Card className="p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Nome" required error={form.errors.name}>
                            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoFocus />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Categoria" error={form.errors.category_id}>
                                <Select
                                    value={form.data.category_id}
                                    onChange={(e) => form.setData('category_id', e.target.value)}
                                >
                                    <option value="">Sem categoria</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Unidade" required error={form.errors.unit}>
                                <Select value={form.data.unit} onChange={(e) => form.setData('unit', e.target.value)}>
                                    {units.map((u) => (
                                        <option key={u.value} value={u.value}>
                                            {u.label}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Preço padrão (R$)" required error={form.errors.price}>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.price}
                                    onChange={(e) => form.setData('price', e.target.value)}
                                />
                            </Field>
                            <Field label="Slug" hint="Automático se vazio." error={form.errors.slug}>
                                <Input value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
                            </Field>
                        </div>

                        <Field label="Descrição" error={form.errors.description}>
                            <Textarea
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                        </Field>

                        <Field label="Foto" error={form.errors.image}>
                            <div className="flex items-center gap-4">
                                {product?.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt=""
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('image', e.target.files?.[0] ?? null)}
                                    className="text-sm text-stone-600"
                                />
                            </div>
                        </Field>

                        <label className="flex items-center gap-2 text-sm text-stone-700">
                            <input
                                type="checkbox"
                                className="accent-brand-600"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                            />
                            Produto ativo (disponível para ofertar em ciclos)
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <ButtonLink href="/admin/produtos" variant="outline">
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
