<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeliveryCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:160'],
            'delivery_date' => ['required', 'date'],
            'order_opens_at' => ['required', 'date'],
            'order_closes_at' => ['required', 'date', 'after:order_opens_at'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'products' => ['array'],
            'products.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'products.*.quantity_available' => ['required', 'numeric', 'min:0'],
            'products.*.price_override' => ['nullable', 'numeric', 'min:0'],

            'points' => ['array'],
            'points.*.delivery_point_id' => ['required', 'integer', 'distinct', 'exists:delivery_points,id'],
            'points.*.scheduled_at' => ['nullable', 'date'],
            'points.*.capacity' => ['nullable', 'integer', 'min:1'],
            'points.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'order_closes_at.after' => 'O fechamento deve ser depois da abertura da janela.',
            'products.*.product_id.distinct' => 'Não repita o mesmo produto no ciclo.',
            'points.*.delivery_point_id.distinct' => 'Não repita o mesmo ponto no ciclo.',
        ];
    }
}
