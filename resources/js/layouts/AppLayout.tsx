import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';
import { useCart } from '@/components/cart/CartContext';
import { Flash } from '@/components/Flash';
import { cn } from '@/lib/cn';
import { SharedProps } from '@/types';

/** Vincula o carrinho ao ciclo atual (esvazia se o cliente mudou de ciclo). */
function CartScope({ cycleId }: { cycleId: number | null }) {
    const { scopeToCycle } = useCart();
    useEffect(() => {
        if (cycleId != null) scopeToCycle(cycleId);
    }, [cycleId, scopeToCycle]);
    return null;
}

function currentPath(): string {
    return typeof window !== 'undefined' ? window.location.pathname : '';
}

function Header() {
    const { auth } = usePage<SharedProps>().props;
    const user = auth?.user;

    return (
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
                    <span className="text-2xl">🌱</span>
                    <span>Horta</span>
                </Link>

                {/* Navegação desktop */}
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
                    <CartButton className="hidden sm:inline-flex" />
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

function CartButton({ className }: { className?: string }) {
    const cart = useCart();
    return (
        <Link
            href="/carrinho"
            className={cn(
                'relative inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50',
                className,
            )}
        >
            🛒<span className="hidden sm:inline">Carrinho</span>
            {cart.count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                    {cart.count}
                </span>
            )}
        </Link>
    );
}

function BottomNav() {
    const { auth } = usePage<SharedProps>().props;
    const user = auth?.user;
    const cart = useCart();
    const path = currentPath();

    const accountHref = user ? (user.is_admin ? '/admin' : '/minhas-reservas') : '/entrar';

    const items = [
        { label: 'Catálogo', icon: '🥬', href: '/', active: path === '/' },
        { label: 'Carrinho', icon: '🛒', href: '/carrinho', active: path.startsWith('/carrinho'), badge: cart.count },
        { label: 'Consultar', icon: '🔎', href: '/consultar-reserva', active: path.startsWith('/consultar') },
        { label: 'Conta', icon: '👤', href: accountHref, active: path.startsWith('/minhas') || path.startsWith('/entrar') },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
            <div className="mx-auto grid max-w-md grid-cols-4">
                {items.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            'relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                            item.active ? 'text-brand-700' : 'text-stone-500',
                        )}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {item.label}
                        {item.badge ? (
                            <span className="absolute right-1/4 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                                {item.badge}
                            </span>
                        ) : null}
                    </Link>
                ))}
            </div>
        </nav>
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
        <div className="flex min-h-dvh flex-col bg-stone-50">
            <CartScope cycleId={cartCycleId} />
            <Header />
            <Flash />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:py-8 sm:pb-10">{children}</main>
            <footer className="hidden border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-400 sm:block">
                🌱 Horta — produtos fresquinhos, entrega coletiva semanal.
            </footer>
            <BottomNav />
        </div>
    );
}
