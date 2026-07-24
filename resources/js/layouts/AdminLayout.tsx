import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { Flash } from '@/components/Flash';
import { cn } from '@/lib/cn';
import { SharedProps } from '@/types';

const nav = [
    { label: 'Dashboard', href: '/admin', match: /^\/admin$/ },
    { label: 'Ciclos de entrega', href: '/admin/ciclos', match: /^\/admin\/ciclos/ },
    { label: 'Produtos', href: '/admin/produtos', match: /^\/admin\/produtos/ },
    { label: 'Categorias', href: '/admin/categorias', match: /^\/admin\/categorias/ },
    { label: 'Pontos de entrega', href: '/admin/pontos', match: /^\/admin\/pontos/ },
];

export default function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
    const { auth, ziggyLocation } = usePage<SharedProps>().props as SharedProps & { ziggyLocation?: string };
    const path = typeof window !== 'undefined' ? window.location.pathname : (ziggyLocation ?? '');
    const user = auth?.user;

    return (
        <div className="flex min-h-full bg-stone-100">
            <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
                <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-6 text-lg font-bold text-brand-700">
                    <span className="text-2xl">🌱</span> Horta · Painel
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {nav.map((item) => {
                        const active = item.match.test(path);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    active ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100',
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-stone-200 p-4">
                    <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100">
                        ← Ver a loja
                    </Link>
                </div>
            </aside>

            <div className="flex min-h-full flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6">
                    <h1 className="text-lg font-semibold text-stone-800">{title ?? 'Painel'}</h1>
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
                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
