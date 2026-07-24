<?php

namespace Database\Seeders;

use App\Models\DeliveryPoint;
use Illuminate\Database\Seeder;

class DeliveryPointSeeder extends Seeder
{
    public function run(): void
    {
        $points = [
            [
                'name' => 'Praça Central',
                'address' => 'Praça da Matriz, s/n — Centro',
                'reference' => 'Em frente ao coreto.',
            ],
            [
                'name' => 'Academia Corpo & Vida',
                'address' => 'Av. das Palmeiras, 1200 — Jardim Europa',
                'reference' => 'Estacionamento lateral.',
            ],
            [
                'name' => 'Portaria do Condomínio Bosque Verde',
                'address' => 'Rua dos Ipês, 45 — Bairro das Flores',
                'reference' => 'Retirar na guarita com o porteiro.',
            ],
        ];

        foreach ($points as $point) {
            DeliveryPoint::updateOrCreate(
                ['name' => $point['name']],
                array_merge($point, ['is_active' => true]),
            );
        }
    }
}
