import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { useCart } from '@/components/cart/CartContext';
import { QuantityInput } from '@/components/QuantityInput';
import { Button, ButtonLink, Card, EmptyState } from '@/components/ui';
import { brl, qty } from '@/lib/format';
import { CatalogProduct, CyclePoint, CycleSummary } from '@/types';

interface Props {
    cycle: CycleSummary | null;
    products: CatalogProduct[];
    points: CyclePoint[];
}

export default function CartIndex({ cycle, products }: Props) {
    const cart = useCart();
    const byId = new Map(products.map((p) => [p.cycle_product_id, p]));

    const lines = cart.lines
        .map((line) => ({ line, product: byId.get(line.cycle_product_id) }))
        .filter((row) => row.product) as { line: { cycle_product_id: number; quantity: number }; product: CatalogProduct }[];

    const total = lines.reduce((sum, { line, product }) => sum + line.quantity * product.price, 0);
    const isEmpty = lines.length === 0;

    return (
        <AppLayout cartCycleId={cycle?.id ?? null}>
            <Head title="Carrinho" />

            <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="text-2xl font-bold text-stone-800">Seu carrinho</h1>

                {isEmpty ? (
                    <EmptyState
                        title="Seu carrinho está vazio"
                        description="Adicione produtos do catálogo para montar sua reserva."
                        action={<ButtonLink href="/">Ver o catálogo</ButtonLink>}
                    />
                ) : (
                    <>
                        <Card>
                            <ul className="divide-y divide-stone-100">
                                {lines.map(({ line, product }) => {
                                    const over = line.quantity > product.remaining;
                                    return (
                                        <li key={product.cycle_product_id} className="flex items-center gap-4 p-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-50 text-2xl">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-full w-full rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    '🥬'
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-stone-900">{product.name}</p>
                                                <p className="text-sm text-stone-500">
                                                    {brl(product.price)} / {product.unit_label}
                                                </p>
                                                {over && (
                                                    <p className="text-xs text-red-600">
                                                        Só restam {qty(product.remaining)} {product.unit_label}.
                                                    </p>
                                                )}
                                            </div>
                                            <QuantityInput
                                                value={line.quantity}
                                                onChange={(v) => cart.setQuantity(product.cycle_product_id, v)}
                                                step={product.step}
                                                max={product.remaining}
                                                unitLabel={product.unit_label}
                                                size="sm"
                                            />
                                            <div className="w-24 text-right font-semibold text-stone-800">
                                                {brl(line.quantity * product.price)}
                                            </div>
                                            <button
                                                onClick={() => cart.remove(product.cycle_product_id)}
                                                className="text-stone-400 hover:text-red-600"
                                                aria-label="Remover"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="flex items-center justify-between border-t border-stone-200 px-4 py-4">
                                <span className="text-sm text-stone-500">Total estimado (paga na entrega)</span>
                                <span className="text-xl font-bold text-brand-700">{brl(total)}</span>
                            </div>
                        </Card>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <ButtonLink href="/" variant="outline">
                                    ← Continuar comprando
                                </ButtonLink>
                                <Button variant="ghost" onClick={() => cart.clear()}>
                                    Esvaziar
                                </Button>
                            </div>
                            <ButtonLink href="/checkout" size="lg">
                                Ir para o checkout →
                            </ButtonLink>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
