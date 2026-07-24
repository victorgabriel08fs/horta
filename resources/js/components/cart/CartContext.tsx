import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CartLine } from '@/types';

interface CartContextValue {
    cycleId: number | null;
    lines: CartLine[];
    quantityOf: (cycleProductId: number) => number;
    setQuantity: (cycleProductId: number, quantity: number) => void;
    remove: (cycleProductId: number) => void;
    clear: () => void;
    count: number;
    totalUnits: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'horta.cart.v1';

interface StoredCart {
    cycleId: number | null;
    lines: CartLine[];
}

function load(): StoredCart {
    if (typeof window === 'undefined') return { cycleId: null, lines: [] };
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { cycleId: null, lines: [] };
        const parsed = JSON.parse(raw) as StoredCart;
        return { cycleId: parsed.cycleId ?? null, lines: Array.isArray(parsed.lines) ? parsed.lines : [] };
    } catch {
        return { cycleId: null, lines: [] };
    }
}

export function CartProvider({ cycleId = null, children }: { cycleId?: number | null; children: ReactNode }) {
    const [lines, setLines] = useState<CartLine[]>(() => {
        const stored = load();
        // Se o carrinho é de outro ciclo, começa vazio.
        if (cycleId !== null && stored.cycleId !== null && stored.cycleId !== cycleId) {
            return [];
        }
        return stored.lines;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cycleId, lines }));
    }, [cycleId, lines]);

    const setQuantity = useCallback((cycleProductId: number, quantity: number) => {
        setLines((prev) => {
            const next = prev.filter((l) => l.cycle_product_id !== cycleProductId);
            if (quantity > 0) {
                next.push({ cycle_product_id: cycleProductId, quantity });
            }
            return next;
        });
    }, []);

    const remove = useCallback((cycleProductId: number) => {
        setLines((prev) => prev.filter((l) => l.cycle_product_id !== cycleProductId));
    }, []);

    const clear = useCallback(() => setLines([]), []);

    const quantityOf = useCallback(
        (cycleProductId: number) => lines.find((l) => l.cycle_product_id === cycleProductId)?.quantity ?? 0,
        [lines],
    );

    const value = useMemo<CartContextValue>(
        () => ({
            cycleId,
            lines,
            quantityOf,
            setQuantity,
            remove,
            clear,
            count: lines.length,
            totalUnits: lines.reduce((sum, l) => sum + l.quantity, 0),
        }),
        [cycleId, lines, quantityOf, setQuantity, remove, clear],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart deve ser usado dentro de <CartProvider>.');
    }
    return ctx;
}
