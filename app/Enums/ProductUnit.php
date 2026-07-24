<?php

namespace App\Enums;

enum ProductUnit: string
{
    case Kg = 'kg';
    case Unidade = 'unidade';
    case Maco = 'maco';
    case Duzia = 'duzia';
    case Bandeja = 'bandeja';
    case Litro = 'litro';

    public function label(): string
    {
        return match ($this) {
            self::Kg => 'Kg',
            self::Unidade => 'Unidade',
            self::Maco => 'Maço',
            self::Duzia => 'Dúzia',
            self::Bandeja => 'Bandeja',
            self::Litro => 'Litro',
        };
    }

    /** Unidades fracionáveis aceitam quantidade decimal; as demais são inteiras. */
    public function allowsFraction(): bool
    {
        return $this === self::Kg || $this === self::Litro;
    }

    /** Passo mínimo de quantidade para o input do cliente. */
    public function step(): float
    {
        return $this->allowsFraction() ? 0.1 : 1.0;
    }
}
