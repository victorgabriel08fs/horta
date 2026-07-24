import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { useCart } from '@/components/cart/CartContext';
import { PointsMap } from '@/components/PointsMap';
import { Button, ButtonLink, Card, EmptyState, Field, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/cn';
import { brl, dateLongBR, qty, timeBR } from '@/lib/format';
import { CatalogProduct, CyclePoint, CycleSummary, SharedProps } from '@/types';

interface Props {
    cycle: CycleSummary;
    points: CyclePoint[];
    products: CatalogProduct[];
}

function CheckoutContent({ cycle, points, products }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const user = auth?.user;
    const cart = useCart();
    const byId = new Map(products.map((p) => [p.cycle_product_id, p]));

    const lines = cart.lines
        .map((line) => ({ line, product: byId.get(line.cycle_product_id) }))
        .filter((row) => row.product) as { line: { cycle_product_id: number; quantity: number }; product: CatalogProduct }[];
    const total = lines.reduce((sum, { line, product }) => sum + line.quantity * product.price, 0);

    const form = useForm({
        cycle_delivery_point_id: points[0]?.id ?? 0,
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        notes: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({ ...data, items: cart.lines })).post('/reservas', {
            onSuccess: () => cart.clear(),
        });
    };

    if (lines.length === 0) {
        return (
            <div className="mx-auto max-w-2xl">
                <EmptyState
                    title="Nada para reservar ainda"
                    description="Adicione produtos ao carrinho antes de finalizar a reserva."
                    action={<ButtonLink href="/">Ver o catálogo</ButtonLink>}
                />
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    {/* Escolha do ponto de entrega */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-stone-800">1. Onde você quer receber?</h2>
                        <p className="mt-1 text-sm text-stone-500">
                            A entrega de <strong className="capitalize">{dateLongBR(cycle.delivery_date)}</strong> passa
                            por estes pontos. Toque no mapa ou escolha na lista:
                        </p>

                        <div className="mt-4">
                            <PointsMap
                                points={points}
                                height={220}
                                activeId={form.data.cycle_delivery_point_id}
                                onSelect={(id) => form.setData('cycle_delivery_point_id', id)}
                            />
                        </div>

                        <div className="mt-4 space-y-3">
                            {points.map((point) => {
                                const selected = form.data.cycle_delivery_point_id === point.id;
                                return (
                                    <label
                                        key={point.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                                            selected
                                                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                                : 'border-stone-200 hover:border-stone-300',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="point"
                                            className="mt-1 accent-brand-600"
                                            checked={selected}
                                            onChange={() => form.setData('cycle_delivery_point_id', point.id)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-stone-900">📍 {point.name}</span>
                                                {point.scheduled_at && (
                                                    <span className="text-sm text-stone-500">
                                                        chega ~{timeBR(point.scheduled_at)}
                                                    </span>
                                                )}
                                            </div>
                                            {point.address && <p className="text-sm text-stone-500">{point.address}</p>}
                                            {point.reference && (
                                                <p className="text-xs text-stone-400">{point.reference}</p>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        {form.errors.cycle_delivery_point_id && (
                            <p className="mt-2 text-sm text-red-600">{form.errors.cycle_delivery_point_id}</p>
                        )}
                    </Card>

                    {/* Dados do cliente */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-stone-800">2. Seus dados</h2>
                        {user ? (
                            <p className="mt-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
                                Reservando como <strong>{user.name}</strong> ({user.email}).
                            </p>
                        ) : (
                            <>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Nome" required error={form.errors.guest_name}>
                                        <Input
                                            value={form.data.guest_name}
                                            onChange={(e) => form.setData('guest_name', e.target.value)}
                                            placeholder="Seu nome completo"
                                        />
                                    </Field>
                                    <Field label="WhatsApp / telefone" error={form.errors.guest_phone}>
                                        <Input
                                            inputMode="tel"
                                            value={form.data.guest_phone}
                                            onChange={(e) => form.setData('guest_phone', e.target.value)}
                                            placeholder="(11) 90000-0000"
                                        />
                                    </Field>
                                    <Field label="E-mail" error={form.errors.guest_email}>
                                        <Input
                                            type="email"
                                            value={form.data.guest_email}
                                            onChange={(e) => form.setData('guest_email', e.target.value)}
                                            placeholder="voce@email.com"
                                        />
                                    </Field>
                                </div>
                                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                    📱 Informe <strong>ao menos um contato</strong> (WhatsApp ou e-mail) — é por ele que
                                    você consulta a reserva depois.
                                </p>
                            </>
                        )}
                        <div className="mt-4">
                            <Field label="Observações (opcional)" error={form.errors.notes}>
                                <Textarea
                                    rows={2}
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    placeholder="Ex.: pode deixar na portaria, prefiro tomates mais maduros…"
                                />
                            </Field>
                        </div>
                    </Card>
                </div>

                {/* Resumo */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-stone-800">Resumo</h2>
                        <ul className="mt-4 space-y-2 text-sm">
                            {lines.map(({ line, product }) => (
                                <li key={product.cycle_product_id} className="flex justify-between gap-2">
                                    <span className="text-stone-600">
                                        {qty(line.quantity)} {product.unit_label} · {product.name}
                                    </span>
                                    <span className="font-medium text-stone-800">
                                        {brl(line.quantity * product.price)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {form.errors.items && (
                            <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{form.errors.items}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                            <span className="text-stone-500">Total</span>
                            <span className="text-xl font-bold text-brand-700">{brl(total)}</span>
                        </div>
                        <p className="mt-1 text-xs text-stone-400">
                            O pagamento é feito na entrega (dinheiro ou PIX). Este valor é apenas uma estimativa.
                        </p>
                        <Button type="submit" size="lg" className="mt-4 w-full" disabled={form.processing}>
                            {form.processing ? 'Confirmando…' : 'Confirmar reserva'}
                        </Button>
                        <ButtonLink href="/carrinho" variant="ghost" className="mt-2 w-full">
                            ← Voltar ao carrinho
                        </ButtonLink>
                    </Card>
                </div>
        </form>
    );
}

export default function Checkout({ cycle, points, products }: Props) {
    return (
        <AppLayout cartCycleId={cycle.id}>
            <Head title="Finalizar reserva" />
            <CheckoutContent cycle={cycle} points={points} products={products} />
        </AppLayout>
    );
}
