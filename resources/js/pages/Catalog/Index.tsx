import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { useCart } from '@/components/cart/CartContext';
import { PointsMap } from '@/components/PointsMap';
import { QuantityInput } from '@/components/QuantityInput';
import { Badge, Button, ButtonLink, Card, EmptyState } from '@/components/ui';
import { brl, dateLongBR, qty, timeBR } from '@/lib/format';
import { CatalogGroup, CatalogProduct, CyclePoint, CycleSummary } from '@/types';

interface Props {
    cycle: CycleSummary | null;
    points: CyclePoint[];
    catalog: CatalogGroup[];
}

function CycleBanner({ cycle, points }: { cycle: CycleSummary; points: CyclePoint[] }) {
    return (
        <Card className="overflow-hidden">
            <div className="bg-linear-to-br from-brand-600 to-brand-700 px-5 py-6 text-white sm:px-6">
                <p className="text-sm font-medium text-brand-100">Entrega desta semana</p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">{cycle.title ?? 'Entrega da semana'}</h1>
                <p className="mt-2 text-sm text-brand-50 sm:text-base">
                    📅 <strong className="capitalize">{dateLongBR(cycle.delivery_date)}</strong>
                    <br />
                    ⏰ Reserve até <strong className="capitalize">{dateLongBR(cycle.order_closes_at)}</strong>, às{' '}
                    {timeBR(cycle.order_closes_at)}
                </p>
            </div>
            <div className="px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    A entrega passa por {points.length} {points.length === 1 ? 'ponto' : 'pontos'} — você escolhe onde retirar
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {points.map((point) => (
                        <span
                            key={point.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
                        >
                            📍 {point.name}
                            {point.scheduled_at && <span className="text-stone-400">· ~{timeBR(point.scheduled_at)}</span>}
                        </span>
                    ))}
                </div>
                <div className="mt-4">
                    <PointsMap points={points} height={200} />
                </div>
            </div>
        </Card>
    );
}

function ProductCard({ product }: { product: CatalogProduct }) {
    const cart = useCart();
    const inCart = cart.quantityOf(product.cycle_product_id);
    const soldOut = product.remaining <= 0;

    return (
        <Card className="flex flex-col overflow-hidden">
            <div className="flex h-28 items-center justify-center bg-brand-50 text-5xl sm:h-32">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <span>🥬</span>
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900">{product.name}</h3>
                    {soldOut ? (
                        <Badge color="red">Esgotado</Badge>
                    ) : (
                        <Badge color="green">
                            {qty(product.remaining)} {product.unit_label}
                        </Badge>
                    )}
                </div>
                {product.description && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{product.description}</p>}
                <div className="mt-2 text-sm text-stone-600">
                    <span className="text-lg font-bold text-brand-700">{brl(product.price)}</span>
                    <span className="text-stone-400"> / {product.unit_label}</span>
                </div>

                <div className="mt-auto pt-4">
                    {soldOut ? (
                        <Button variant="outline" size="md" className="w-full" disabled>
                            Esgotado
                        </Button>
                    ) : inCart > 0 ? (
                        <div className="flex items-center justify-between">
                            <QuantityInput
                                value={inCart}
                                onChange={(v) => cart.setQuantity(product.cycle_product_id, v)}
                                step={product.step}
                                max={product.remaining}
                                unitLabel={product.unit_label}
                            />
                            <span className="text-sm font-semibold text-brand-700">{brl(inCart * product.price)}</span>
                        </div>
                    ) : (
                        <Button
                            size="md"
                            className="w-full"
                            onClick={() => cart.setQuantity(product.cycle_product_id, product.step)}
                        >
                            + Adicionar
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

function CartBar() {
    const cart = useCart();
    if (cart.count === 0) return null;

    return (
        <div className="sticky bottom-20 z-30 mx-auto max-w-2xl sm:bottom-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-900 px-4 py-3 text-white shadow-xl">
                <span className="text-sm">
                    <strong>{cart.count}</strong> {cart.count === 1 ? 'item' : 'itens'}
                </span>
                <div className="flex gap-2">
                    <Link href="/carrinho" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-200 hover:bg-white/10">
                        Carrinho
                    </Link>
                    <ButtonLink href="/checkout" size="md">
                        Finalizar →
                    </ButtonLink>
                </div>
            </div>
        </div>
    );
}

export default function CatalogIndex({ cycle, points, catalog }: Props) {
    return (
        <AppLayout cartCycleId={cycle?.id ?? null}>
            <Head title="Catálogo" />

            {!cycle ? (
                <div className="py-8">
                    <EmptyState
                        title="Nenhuma entrega aberta agora"
                        description="No momento não há uma janela de pedidos aberta. Volte em breve para reservar os produtos da próxima entrega. 🌱"
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    <CycleBanner cycle={cycle} points={points} />

                    {catalog.map((group) => (
                        <section key={group.category}>
                            <h2 className="mb-3 text-lg font-bold text-stone-800">{group.category}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {group.products.map((product) => (
                                    <ProductCard key={product.cycle_product_id} product={product} />
                                ))}
                            </div>
                        </section>
                    ))}

                    <CartBar />
                </div>
            )}
        </AppLayout>
    );
}
