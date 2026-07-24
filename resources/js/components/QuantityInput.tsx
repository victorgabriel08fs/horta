import { cn } from '@/lib/cn';
import { qty as fmtQty } from '@/lib/format';

interface Props {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    max?: number;
    min?: number;
    unitLabel?: string;
    size?: 'sm' | 'md';
}

export function QuantityInput({ value, onChange, step = 1, max, min = 0, unitLabel, size = 'md' }: Props) {
    const clamp = (v: number) => {
        let next = v;
        if (max !== undefined) next = Math.min(next, max);
        if (next < min) next = min;
        // Evita ruído de ponto flutuante.
        return Math.round(next * 100) / 100;
    };

    const dec = () => onChange(clamp(value - step));
    const inc = () => onChange(clamp(value + step));

    const btn =
        'flex items-center justify-center rounded-lg border border-stone-300 bg-white text-lg text-stone-700 hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed';
    const btnSize = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

    return (
        <div className="inline-flex items-center gap-1.5">
            <button type="button" className={cn(btn, btnSize)} onClick={dec} disabled={value <= min} aria-label="Diminuir">
                −
            </button>
            <div className={cn('min-w-14 text-center', size === 'sm' ? 'text-sm' : 'text-base')}>
                <span className="font-semibold text-stone-900">{fmtQty(value)}</span>
                {unitLabel && <span className="ml-1 text-xs text-stone-500">{unitLabel}</span>}
            </div>
            <button
                type="button"
                className={cn(btn, btnSize)}
                onClick={inc}
                disabled={max !== undefined && value >= max}
                aria-label="Aumentar"
            >
                +
            </button>
        </div>
    );
}
