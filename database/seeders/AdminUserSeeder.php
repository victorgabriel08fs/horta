<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@horta.local'],
            [
                'name' => 'Gestor da Horta',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'phone' => '(11) 90000-0000',
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'cliente@horta.local'],
            [
                'name' => 'Cliente Demonstração',
                'password' => Hash::make('password'),
                'role' => UserRole::Customer,
                'phone' => '(11) 91111-1111',
                'email_verified_at' => now(),
            ],
        );
    }
}
