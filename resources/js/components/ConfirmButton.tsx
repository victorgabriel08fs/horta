import { router } from '@inertiajs/react';
import { cn } from '@/lib/cn';

interface Props {
    href: string;
    method?: 'delete' | 'post' | 'patch' | 'put';
    data?: Record<string, unknown>;
    message?: string;
    className?: string;
    children: React.ReactNode;
    preserveScroll?: boolean;
}

export function ConfirmButton({
    href,
    method = 'delete',
    data,
    message = 'Tem certeza?',
    className,
    children,
    preserveScroll = true,
}: Props) {
    const handle = () => {
        if (window.confirm(message)) {
            router.visit(href, { method, data, preserveScroll });
        }
    };

    return (
        <button
            type="button"
            onClick={handle}
            className={cn('text-sm font-medium text-red-600 hover:text-red-700', className)}
        >
            {children}
        </button>
    );
}
