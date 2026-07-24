import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { CartProvider, useCart } from '@/components/cart/CartContext';
import { Flash } from '@/components/Flash';
import { SharedProps } from '@/types';

function Header() {
    const { auth } = usePage<SharedProps>().props;
    const cart = useCart();
    const user = auth?.user;

    return (
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
                    <span className="text-2xl">🌱</span>
                    <span>Horta</span>
                </Link>

                <nav className="hidden items-center gap-1 text-sm font-medium text-stone-600 sm:flex">
                    <Link href="/" className="rounded-md px-3 py-2 hover:bg-stone-100">
                        Catálogo
                    </Link>
                    <Link href="/consultar-reserva" className="rounded-md px-3 py-2 hover:bg-stone-100">
                        Consultar reserva
                    </Link>
                    {user && !user.is_admin && (
                        <Link href="/minhas-reservas" className="rounded-md px-3 py-2 hover:bg-stone-100">
                            Minhas reservas
                        </Link>
                    )}
                    {user?.is_admin && (
                        <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-stone-100">
                            Painel
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="/carrinho"
                        className="relative inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                    >
                        🛒<span className="hidden sm:inline">Carrinho</span>
                        {cart.count > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                                {cart.count}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <button
                            onClick={() => router.post('/sair')}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100"
                        >
                            Sair
                        </button>
                    ) : (
                        <Link
                            href="/entrar"
                            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
                        >
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function AppLayout({
    children,
    cartCycleId = null,
}: {
    children: ReactNode;
    cartCycleId?: number | null;
}) {
    return (
        <CartProvider cycleId={cartCycleId}>
            <div className="flex min-h-full flex-col bg-stone-50">
                <Header />
                <Flash />
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
                <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-400">
                    🌱 Horta — produtos fresquinhos, entrega coletiva semanal.
                </footer>
            </div>
        </CartProvider>
    );
}
