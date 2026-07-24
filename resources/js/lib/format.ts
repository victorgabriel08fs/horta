export function brl(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value ?? 0);
}

export function qty(value: number): string {
    if (Number.isInteger(value)) {
        return String(value);
    }
    return value.toFixed(2).replace('.', ',').replace(/,?0+$/, '');
}

export function dateBR(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function dateLongBR(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
    });
}

export function timeBR(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function dateTimeBR(iso: string): string {
    return `${dateBR(iso)} ${timeBR(iso)}`;
}

const unitLabels: Record<string, string> = {
    kg: 'Kg',
    unidade: 'Unidade',
    maco: 'Maço',
    duzia: 'Dúzia',
    bandeja: 'Bandeja',
    litro: 'Litro',
};

export function unitLabel(unit: string): string {
    return unitLabels[unit] ?? unit;
}
