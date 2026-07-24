import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, ButtonLink, Card, Field, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/cn';
import { brl } from '@/lib/format';

interface CycleProductRow {
    product_id: number;
    quantity_available: number;
    price_override: number | null;
}
interface CyclePointRow {
    delivery_point_id: number;
    scheduled_at: string | null;
    capacity: number | null;
    notes: string | null;
}
interface CycleData {
    id: number;
    title: string | null;
    delivery_date: string;
    order_opens_at: string;
    order_closes_at: string;
    notes: string | null;
    status: string;
    products: CycleProductRow[];
    points: CyclePointRow[];
}
interface Props {
    cycle: CycleData | null;
    availableProducts: { id: number; name: string; unit_label: string; price: number; is_active: boolean }[];
    availablePoints: { id: number; name: string; address: string | null; is_active: boolean }[];
}

type ProductState = Record<number, { included: boolean; quantity_available: string; price_override: string }>;
type PointState = Record<number, { included: boolean; scheduled_at: string; capacity: string; notes: string }>;

export default function CycleForm({ cycle, availableProducts, availablePoints }: Props) {
    const editing = Boolean(cycle);

    const form = useForm({
        title: cycle?.title ?? '',
        delivery_date: cycle?.delivery_date ?? '',
        order_opens_at: cycle?.order_opens_at ?? '',
        order_closes_at: cycle?.order_closes_at ?? '',
        notes: cycle?.notes ?? '',
    });

    const [products, setProducts] = useState<ProductState>(() => {
        const map: ProductState = {};
        availableProducts.forEach((p) => {
            const existing = cycle?.products.find((cp) => cp.product_id === p.id);
            map[p.id] = {
                included: Boolean(existing),
                quantity_available: existing ? String(existing.quantity_available) : '',
                price_override: existing?.price_override != null ? String(existing.price_override) : '',
            };
        });
        return map;
    });

    const [points, setPoints] = useState<PointState>(() => {
        const map: PointState = {};
        availablePoints.forEach((p) => {
            const existing = cycle?.points.find((cp) => cp.delivery_point_id === p.id);
            map[p.id] = {
                included: Boolean(existing),
                scheduled_at: existing?.scheduled_at ?? '',
                capacity: existing?.capacity != null ? String(existing.capacity) : '',
                notes: existing?.notes ?? '',
            };
        });
        return map;
    });

    const selectedCount = useMemo(
        () => ({
            products: Object.values(products).filter((p) => p.included).length,
            points: Object.values(points).filter((p) => p.included).length,
        }),
        [products, points],
    );

    const setProduct = (id: number, patch: Partial<ProductState[number]>) =>
        setProducts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    const setPoint = (id: number, patch: Partial<PointState[number]>) =>
        setPoints((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const productPayload = Object.entries(products)
            .filter(([, v]) => v.included)
            .map(([id, v]) => ({
                product_id: Number(id),
                quantity_available: Number(v.quantity_available || 0),
                price_override: v.price_override === '' ? null : Number(v.price_override),
            }));

        const pointPayload = Object.entries(points)
            .filter(([, v]) => v.included)
            .map(([id, v]) => ({
                delivery_point_id: Number(id),
                scheduled_at: v.scheduled_at || null,
                capacity: v.capacity === '' ? null : Number(v.capacity),
                notes: v.notes || null,
            }));

        form.transform((d) => ({ ...d, products: productPayload, points: pointPayload }));
        if (editing) {
            form.put(`/admin/ciclos/${cycle!.id}`);
        } else {
            form.post('/admin/ciclos');
        }
    };

    const nestedError = Object.keys(form.errors).find((k) => k.startsWith('products') || k.startsWith('points'));

    return (
        <AdminLayout title={editing ? 'Editar ciclo' : 'Novo ciclo'}>
            <Head title={editing ? 'Editar ciclo' : 'Novo ciclo'} />

            <form onSubmit={submit} className="space-y-6">
                <Card className="p-6">
                    <h2 className="mb-4 text-lg font-bold text-stone-800">Dados do ciclo</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Título" hint="Ex.: Entrega — semana 30/2026" error={form.errors.title}>
                            <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                        </Field>
                        <Field label="Data da entrega" required error={form.errors.delivery_date}>
                            <Input
                                type="date"
                                value={form.data.delivery_date}
                                onChange={(e) => form.setData('delivery_date', e.target.value)}
                            />
                        </Field>
                        <Field label="Abertura dos pedidos" required error={form.errors.order_opens_at}>
                            <Input
                                type="datetime-local"
                                value={form.data.order_opens_at}
                                onChange={(e) => form.setData('order_opens_at', e.target.value)}
                            />
                        </Field>
                        <Field label="Fechamento dos pedidos" required error={form.errors.order_closes_at}>
                            <Input
                                type="datetime-local"
                                value={form.data.order_closes_at}
                                onChange={(e) => form.setData('order_closes_at', e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="mt-4">
                        <Field label="Observações" error={form.errors.notes}>
                            <Textarea
                                rows={2}
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                            />
                        </Field>
                    </div>
                </Card>

                {/* Produtos do ciclo */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-stone-800">
                        Produtos disponíveis <span className="text-sm font-normal text-stone-400">({selectedCount.products} selecionados)</span>
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">Marque os produtos e informe a quantidade ofertada nesta semana.</p>
                    <div className="mt-4 divide-y divide-stone-100">
                        {availableProducts.map((p) => {
                            const state = products[p.id];
                            return (
                                <div
                                    key={p.id}
                                    className={cn('flex flex-wrap items-center gap-3 py-2.5', !p.is_active && 'opacity-60')}
                                >
                                    <label className="flex min-w-52 flex-1 items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="accent-brand-600"
                                            checked={state.included}
                                            onChange={(e) => setProduct(p.id, { included: e.target.checked })}
                                        />
                                        <span className="font-medium text-stone-800">{p.name}</span>
                                        <span className="text-xs text-stone-400">
                                            {p.unit_label} · {brl(p.price)}
                                        </span>
                                    </label>
                                    {state.included && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Qtd."
                                                className="w-28"
                                                value={state.quantity_available}
                                                onChange={(e) => setProduct(p.id, { quantity_available: e.target.value })}
                                            />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={`Preço (${brl(p.price)})`}
                                                className="w-36"
                                                value={state.price_override}
                                                onChange={(e) => setProduct(p.id, { price_override: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Pontos de entrega do ciclo */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-stone-800">
                        Pontos de entrega <span className="text-sm font-normal text-stone-400">({selectedCount.points} selecionados)</span>
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">A rota desta semana passa pelos pontos marcados. Informe o horário estimado de cada parada.</p>
                    <div className="mt-4 space-y-2">
                        {availablePoints.map((p) => {
                            const state = points[p.id];
                            return (
                                <div
                                    key={p.id}
                                    className={cn(
                                        'rounded-lg border p-3',
                                        state.included ? 'border-brand-200 bg-brand-50/40' : 'border-stone-200',
                                        !p.is_active && 'opacity-60',
                                    )}
                                >
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="accent-brand-600"
                                            checked={state.included}
                                            onChange={(e) => setPoint(p.id, { included: e.target.checked })}
                                        />
                                        <span className="font-medium text-stone-800">📍 {p.name}</span>
                                        {p.address && <span className="text-xs text-stone-400">{p.address}</span>}
                                    </label>
                                    {state.included && (
                                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                            <Field label="Horário estimado">
                                                <Input
                                                    type="datetime-local"
                                                    value={state.scheduled_at}
                                                    onChange={(e) => setPoint(p.id, { scheduled_at: e.target.value })}
                                                />
                                            </Field>
                                            <Field label="Capacidade (opcional)">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={state.capacity}
                                                    onChange={(e) => setPoint(p.id, { capacity: e.target.value })}
                                                />
                                            </Field>
                                            <Field label="Observações">
                                                <Input
                                                    value={state.notes}
                                                    onChange={(e) => setPoint(p.id, { notes: e.target.value })}
                                                />
                                            </Field>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {nestedError && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        Revise os produtos e pontos selecionados: {form.errors[nestedError as keyof typeof form.errors]}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <ButtonLink href="/admin/ciclos" variant="outline">
                        Cancelar
                    </ButtonLink>
                    <Button type="submit" disabled={form.processing}>
                        {editing ? 'Salvar ciclo' : 'Criar ciclo'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
