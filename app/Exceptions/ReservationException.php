<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Erro de regra de negócio ao efetivar uma reserva
 * (janela fechada, ponto inválido, estoque insuficiente, quantidade inválida).
 */
class ReservationException extends RuntimeException
{
    public static function cycleClosed(): self
    {
        return new self('A janela de pedidos deste ciclo não está aberta.');
    }

    public static function invalidPoint(): self
    {
        return new self('O ponto de entrega selecionado não é válido para este ciclo.');
    }

    public static function emptyCart(): self
    {
        return new self('Adicione ao menos um produto para reservar.');
    }

    public static function productUnavailable(string $productName): self
    {
        return new self("O produto \"{$productName}\" não está disponível neste ciclo.");
    }

    public static function insufficientStock(string $productName, float $remaining): self
    {
        $qty = rtrim(rtrim(number_format($remaining, 2, ',', '.'), '0'), ',');

        return new self("Estoque insuficiente para \"{$productName}\". Restam apenas {$qty}.");
    }

    public static function invalidQuantity(string $productName): self
    {
        return new self("Quantidade inválida para \"{$productName}\".");
    }

    public static function pointFull(string $pointName): self
    {
        return new self("O ponto \"{$pointName}\" atingiu a capacidade máxima de reservas.");
    }
}
