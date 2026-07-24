import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { SharedProps } from '@/types';

export function Flash() {
    const { flash } = usePage<SharedProps>().props;
    const [visible, setVisible] = useState(true);

    const message = flash?.success ?? flash?.error ?? null;
    const isError = Boolean(flash?.error);

    useEffect(() => {
        setVisible(true);
        if (!message) return;
        const timer = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message || !visible) return null;

    return (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
            <div
                className={
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ' +
                    (isError ? 'bg-red-600 text-white' : 'bg-brand-600 text-white')
                }
                role="status"
            >
                <span>{message}</span>
                <button onClick={() => setVisible(false)} className="text-white/80 hover:text-white" aria-label="Fechar">
                    ✕
                </button>
            </div>
        </div>
    );
}
