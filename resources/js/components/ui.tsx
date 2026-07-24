import { Link } from '@inertiajs/react';
import {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-stone-800 text-white hover:bg-stone-900 shadow-sm',
    outline: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50',
    ghost: 'text-stone-600 hover:bg-stone-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

const baseButton =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
    return <button className={cn(baseButton, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
    variant = 'primary',
    size = 'md',
    className,
    href,
    ...props
}: {
    variant?: Variant;
    size?: Size;
    className?: string;
    href: string;
    children: ReactNode;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: string;
    preserveScroll?: boolean;
    onClick?: () => void;
}) {
    return <Link href={href} className={cn(baseButton, variants[variant], sizes[size], className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
                className,
            )}
            {...props}
        />
    );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
                className,
            )}
            {...props}
        />
    );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label className={cn('mb-1 block text-sm font-medium text-stone-700', className)} {...props}>
            {children}
        </label>
    );
}

export function Field({
    label,
    error,
    children,
    hint,
    required,
}: {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            {label && (
                <Label>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}
            {children}
            {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <div className={cn('rounded-xl border border-stone-200 bg-white shadow-sm', className)}>{children}</div>
    );
}

export function Badge({
    color = 'stone',
    children,
    className,
}: {
    color?: 'stone' | 'green' | 'amber' | 'red' | 'blue';
    children: ReactNode;
    className?: string;
}) {
    const colors: Record<string, string> = {
        stone: 'bg-stone-100 text-stone-700',
        green: 'bg-brand-100 text-brand-800',
        amber: 'bg-amber-100 text-amber-800',
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700',
    };
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                colors[color],
                className,
            )}
        >
            {children}
        </span>
    );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-stone-700">{title}</h3>
            {description && <p className="mx-auto mt-1 max-w-md text-sm text-stone-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

const statusColors: Record<string, 'stone' | 'green' | 'amber' | 'red' | 'blue'> = {
    draft: 'stone',
    open: 'green',
    closed: 'amber',
    delivered: 'blue',
    cancelled: 'red',
    confirmed: 'green',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
    return <Badge color={statusColors[status] ?? 'stone'}>{label}</Badge>;
}
