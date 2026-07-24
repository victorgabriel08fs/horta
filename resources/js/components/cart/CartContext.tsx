import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CartLine } from '@/types';

interface CartContextValue {
    cycleId: number | null;
    lines: CartLine[];
    quantityOf: (cycleProductId: number) => number;
    setQuantity: (cycleProductId: number, quantity: number) => void;
    remove: (cycleProductId: number) => void;
    clear: () => void;
    /** Vincula o carrinho a um ciclo; se for outro ciclo, esvazia. */
    scopeToCycle: (cycleId: number) => void;
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

/**
 * Provider global do carrinho (montado na raiz em app.tsx).
 * Assim `useCart()` funciona em qualquer componente — inclusive no corpo de uma página.
 */
export function CartProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<StoredCart>(() => load());

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const scopeToCycle = useCallback((cycleId: number) => {
        setState((prev) => (prev.cycleId === cycleId ? prev : { cycleId, lines: [] }));
    }, []);

    const setQuantity = useCallback((cycleProductId: number, quantity: number) => {
        setState((prev) => {
            const lines = prev.lines.filter((l) => l.cycle_product_id !== cycleProductId);
            if (quantity > 0) {
                lines.push({ cycle_product_id: cycleProductId, quantity });
            }
            return { ...prev, lines };
        });
    }, []);

    const remove = useCallback((cycleProductId: number) => {
        setState((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.cycle_product_id !== cycleProductId) }));
    }, []);

    const clear = useCallback(() => setState((prev) => ({ ...prev, lines: [] })), []);

    const quantityOf = useCallback(
        (cycleProductId: number) => state.lines.find((l) => l.cycle_product_id === cycleProductId)?.quantity ?? 0,
        [state.lines],
    );

    const value = useMemo<CartContextValue>(
        () => ({
            cycleId: state.cycleId,
            lines: state.lines,
            quantityOf,
            setQuantity,
            remove,
            clear,
            scopeToCycle,
            count: state.lines.length,
            totalUnits: state.lines.reduce((sum, l) => sum + l.quantity, 0),
        }),
        [state, quantityOf, setQuantity, remove, clear, scopeToCycle],
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
