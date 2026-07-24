<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isGuest = ! $this->user();

        return [
            'cycle_delivery_point_id' => ['required', 'integer', 'exists:cycle_delivery_points,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.cycle_product_id' => ['required', 'integer', 'exists:cycle_products,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'guest_name' => [Rule::requiredIf($isGuest), 'nullable', 'string', 'max:120'],
            'guest_phone' => [Rule::requiredIf($isGuest), 'nullable', 'string', 'max:40'],
            'guest_email' => ['nullable', 'email', 'max:160'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'cycle_delivery_point_id' => 'ponto de entrega',
            'items' => 'itens',
            'guest_name' => 'nome',
            'guest_phone' => 'WhatsApp/telefone',
            'guest_email' => 'e-mail',
        ];
    }

    public function messages(): array
    {
        return [
            'cycle_delivery_point_id.required' => 'Escolha um ponto de entrega.',
            'items.required' => 'Adicione ao menos um produto.',
            'items.min' => 'Adicione ao menos um produto.',
        ];
    }
}
