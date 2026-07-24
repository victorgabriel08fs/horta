<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/entrar');
    }

    public function test_customers_cannot_access_admin(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)->get('/admin')->assertForbidden();
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/Dashboard'));
    }

    public function test_admin_can_create_a_product(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/produtos', [
            'name' => 'Alface Nova',
            'unit' => 'unidade',
            'price' => 4.5,
            'is_active' => true,
        ])->assertRedirect('/admin/produtos');

        $this->assertDatabaseHas('products', ['name' => 'Alface Nova']);
    }
}
