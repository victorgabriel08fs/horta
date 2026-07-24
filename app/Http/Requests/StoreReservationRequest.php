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

        $rules = [
            'cycle_delivery_point_id' => ['required', 'integer', 'exists:cycle_delivery_points,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.cycle_product_id' => ['required', 'integer', 'exists:cycle_products,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        if ($isGuest) {
            // Convidado: nome obrigatório + ao menos um contato (WhatsApp OU e-mail).
            $rules['guest_name'] = ['required', 'string', 'max:120'];
            $rules['guest_phone'] = ['nullable', 'required_without:guest_email', 'string', 'max:40'];
            $rules['guest_email'] = ['nullable', 'required_without:guest_phone', 'email', 'max:160'];
        } else {
            $rules['guest_name'] = ['nullable', 'string', 'max:120'];
            $rules['guest_phone'] = ['nullable', 'string', 'max:40'];
            $rules['guest_email'] = ['nullable', 'email', 'max:160'];
        }

        return $rules;
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
            'guest_phone.required_without' => 'Informe ao menos um contato: WhatsApp ou e-mail.',
            'guest_email.required_without' => 'Informe ao menos um contato: WhatsApp ou e-mail.',
        ];
    }
}
