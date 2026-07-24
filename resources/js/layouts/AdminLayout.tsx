import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { Flash } from '@/components/Flash';
import { cn } from '@/lib/cn';
import { SharedProps } from '@/types';

const nav = [
    { label: 'Dashboard', href: '/admin', match: /^\/admin$/, icon: '📊' },
    { label: 'Ciclos de entrega', href: '/admin/ciclos', match: /^\/admin\/ciclos/, icon: '🗓️' },
    { label: 'Produtos', href: '/admin/produtos', match: /^\/admin\/produtos/, icon: '🥬' },
    { label: 'Categorias', href: '/admin/categorias', match: /^\/admin\/categorias/, icon: '🏷️' },
    { label: 'Pontos de entrega', href: '/admin/pontos', match: /^\/admin\/pontos/, icon: '📍' },
];

function NavLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
    return (
        <nav className="flex-1 space-y-1 p-4">
            {nav.map((item) => {
                const active = item.match.test(path);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            active ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100',
                        )}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
    const { auth } = usePage<SharedProps>().props;
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const user = auth?.user;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex min-h-dvh bg-stone-100">
            {/* Sidebar desktop */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
                <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-6 text-lg font-bold text-brand-700">
                    <span className="text-2xl">🌱</span> Horta · Painel
                </div>
                <NavLinks path={path} />
                <div className="border-t border-stone-200 p-4">
                    <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100">
                        ← Ver a loja
                    </Link>
                </div>
            </aside>

            {/* Drawer mobile */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-stone-900/40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
                        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5 text-lg font-bold text-brand-700">
                            <span className="flex items-center gap-2">
                                <span className="text-2xl">🌱</span> Painel
                            </span>
                            <button onClick={() => setMenuOpen(false)} className="p-2 text-stone-400" aria-label="Fechar">
                                ✕
                            </button>
                        </div>
                        <NavLinks path={path} onNavigate={() => setMenuOpen(false)} />
                        <div className="border-t border-stone-200 p-4">
                            <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100">
                                ← Ver a loja
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex min-h-dvh flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
                            aria-label="Menu"
                        >
                            ☰
                        </button>
                        <h1 className="text-base font-semibold text-stone-800 sm:text-lg">{title ?? 'Painel'}</h1>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                        <span className="hidden sm:inline">{user?.name}</span>
                        <button
                            onClick={() => router.post('/sair')}
                            className="rounded-lg px-3 py-2 font-medium text-stone-500 hover:bg-stone-100"
                        >
                            Sair
                        </button>
                    </div>
                </header>
                <Flash />
                <main className="flex-1 p-4 sm:p-6">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
