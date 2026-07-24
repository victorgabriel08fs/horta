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

function CartContents({ products }: { products: CatalogProduct[] }) {
    const cart = useCart();
    const byId = new Map(products.map((p) => [p.cycle_product_id, p]));

    const lines = cart.lines
        .map((line) => ({ line, product: byId.get(line.cycle_product_id) }))
        .filter((row) => row.product) as {
        line: { cycle_product_id: number; quantity: number };
        product: CatalogProduct;
    }[];

    const total = lines.reduce((sum, { line, product }) => sum + line.quantity * product.price, 0);

    if (lines.length === 0) {
        return (
            <EmptyState
                title="Seu carrinho está vazio"
                description="Adicione produtos do catálogo para montar sua reserva."
                action={<ButtonLink href="/">Ver o catálogo</ButtonLink>}
            />
        );
    }

    return (
        <>
            <Card>
                <ul className="divide-y divide-stone-100">
                    {lines.map(({ line, product }) => {
                        const over = line.quantity > product.remaining;
                        return (
                            <li key={product.cycle_product_id} className="flex items-center gap-3 p-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-2xl">
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
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <QuantityInput
                                            value={line.quantity}
                                            onChange={(v) => cart.setQuantity(product.cycle_product_id, v)}
                                            step={product.step}
                                            max={product.remaining}
                                            unitLabel={product.unit_label}
                                            size="sm"
                                        />
                                        <span className="font-semibold text-stone-800">
                                            {brl(line.quantity * product.price)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => cart.remove(product.cycle_product_id)}
                                    className="self-start p-1 text-stone-400 hover:text-red-600"
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                    <ButtonLink href="/" variant="outline">
                        ← Continuar
                    </ButtonLink>
                    <Button variant="ghost" onClick={() => cart.clear()}>
                        Esvaziar
                    </Button>
                </div>
                <ButtonLink href="/checkout" size="lg" className="w-full sm:w-auto">
                    Ir para o checkout →
                </ButtonLink>
            </div>
        </>
    );
}

export default function CartIndex({ cycle, products }: Props) {
    return (
        <AppLayout cartCycleId={cycle?.id ?? null}>
            <Head title="Carrinho" />
            <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="text-2xl font-bold text-stone-800">Seu carrinho</h1>
                <CartContents products={products} />
            </div>
        </AppLayout>
    );
}
