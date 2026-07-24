<?php

namespace Database\Seeders;

use App\Enums\CycleStatus;
use App\Enums\ProductUnit;
use App\Enums\ReservationStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DeliveryCycle;
use App\Models\DeliveryPoint;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Popula o banco com um volume grande (e meio exagerado) de dados de demonstração:
 * dezenas de produtos e pontos, ~100 clientes e uma linha do tempo de ciclos
 * (passados/entregues, fechados, o atual em aberto e futuros programados),
 * com centenas de reservas realistas — registradas e convidadas.
 *
 * Rodar isolado:  php artisan db:seed --class=BigDemoSeeder
 */
class BigDemoSeeder extends Seeder
{
    /** Ajuste estes números para deixar mais leve ou mais exagerado. */
    private const CUSTOMERS = 100;
    private const PAST_CYCLES = 8;
    private const FUTURE_CYCLES = 3;
    private const RES_PER_ACTIVE_CYCLE = [18, 40]; // min, max de reservas por ciclo com pedidos

    /** @var array<string, bool> códigos já usados nesta rodada */
    private array $usedCodes = [];

    public function run(): void
    {
        // Pré-requisitos (idempotentes).
        $this->call([AdminUserSeeder::class, CategorySeeder::class, DeliveryPointSeeder::class]);

        DB::transaction(function () {
            $this->seedExtraCategories();
            $products = $this->seedProducts();
            $points = $this->seedPoints();
            $customers = $this->seedCustomers();

            $this->seedCycles($products, $points, $customers);
        });

        $this->command?->info(sprintf(
            'BigDemoSeeder: %d clientes, %d produtos, %d pontos, %d ciclos, %d reservas.',
            User::where('role', UserRole::Customer->value)->count(),
            Product::count(),
            DeliveryPoint::count(),
            DeliveryCycle::count(),
            Reservation::count(),
        ));
    }

    private function seedExtraCategories(): void
    {
        foreach ([
            ['name' => 'Raízes', 'slug' => 'raizes', 'position' => 5],
            ['name' => 'Ervas', 'slug' => 'ervas', 'position' => 6],
            ['name' => 'Ovos & Laticínios', 'slug' => 'ovos-laticinios', 'position' => 7],
        ] as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c);
        }
    }

    /** @return \Illuminate\Support\Collection<int, Product> */
    private function seedProducts()
    {
        $categories = Category::pluck('id', 'slug');
        $u = ProductUnit::class;

        // [nome, categoria, unidade, preçoMin, preçoMax]
        $pool = [
            // Folhas
            ['Alface Crespa', 'folhas', $u::Unidade, 3.0, 4.5], ['Alface Americana', 'folhas', $u::Unidade, 3.5, 5.0],
            ['Alface Roxa', 'folhas', $u::Unidade, 3.5, 5.0], ['Rúcula', 'folhas', $u::Maco, 3.5, 5.0],
            ['Espinafre', 'folhas', $u::Maco, 4.0, 6.0], ['Couve Manteiga', 'folhas', $u::Maco, 3.0, 4.5],
            ['Acelga', 'folhas', $u::Unidade, 4.5, 6.5], ['Agrião', 'folhas', $u::Maco, 3.5, 5.0],
            ['Almeirão', 'folhas', $u::Maco, 3.0, 4.5], ['Chicória', 'folhas', $u::Maco, 3.0, 4.5],
            ['Escarola', 'folhas', $u::Unidade, 3.5, 5.0],
            // Legumes
            ['Tomate Italiano', 'legumes', $u::Kg, 7.0, 11.0], ['Tomate Cereja', 'legumes', $u::Bandeja, 6.0, 9.0],
            ['Cenoura', 'legumes', $u::Kg, 4.5, 7.0], ['Abobrinha Italiana', 'legumes', $u::Kg, 5.0, 8.0],
            ['Beterraba', 'legumes', $u::Kg, 4.5, 7.0], ['Pepino', 'legumes', $u::Kg, 4.0, 6.5],
            ['Berinjela', 'legumes', $u::Kg, 5.0, 7.5], ['Pimentão Verde', 'legumes', $u::Kg, 6.0, 9.0],
            ['Pimentão Amarelo', 'legumes', $u::Kg, 8.0, 12.0], ['Chuchu', 'legumes', $u::Kg, 3.0, 5.0],
            ['Vagem', 'legumes', $u::Kg, 8.0, 12.0], ['Quiabo', 'legumes', $u::Kg, 7.0, 10.0],
            ['Abóbora Cabotiá', 'legumes', $u::Kg, 4.0, 6.5], ['Brócolis', 'legumes', $u::Unidade, 5.0, 8.0],
            ['Couve-flor', 'legumes', $u::Unidade, 5.0, 8.0], ['Repolho', 'legumes', $u::Unidade, 4.0, 6.0],
            // Raízes
            ['Batata', 'raizes', $u::Kg, 4.0, 6.5], ['Batata-doce', 'raizes', $u::Kg, 4.5, 7.0],
            ['Mandioca', 'raizes', $u::Kg, 4.0, 6.0], ['Inhame', 'raizes', $u::Kg, 6.0, 9.0],
            ['Nabo', 'raizes', $u::Kg, 4.0, 6.0], ['Rabanete', 'raizes', $u::Maco, 3.0, 4.5],
            // Temperos / Ervas
            ['Manjericão', 'temperos', $u::Maco, 2.5, 4.0], ['Cebolinha', 'temperos', $u::Maco, 2.0, 3.5],
            ['Salsa', 'temperos', $u::Maco, 2.0, 3.5], ['Coentro', 'temperos', $u::Maco, 2.0, 3.5],
            ['Hortelã', 'ervas', $u::Maco, 2.5, 4.0], ['Alecrim', 'ervas', $u::Maco, 3.0, 4.5],
            ['Tomilho', 'ervas', $u::Maco, 3.0, 4.5], ['Orégano Fresco', 'ervas', $u::Maco, 3.0, 4.5],
            ['Sálvia', 'ervas', $u::Maco, 3.5, 5.0], ['Louro', 'ervas', $u::Maco, 3.0, 4.5],
            // Frutas
            ['Morango', 'frutas', $u::Bandeja, 10.0, 15.0], ['Banana Prata', 'frutas', $u::Kg, 5.0, 8.0],
            ['Mamão Papaia', 'frutas', $u::Kg, 5.0, 8.0], ['Limão Taiti', 'frutas', $u::Kg, 4.0, 7.0],
            ['Laranja Pera', 'frutas', $u::Kg, 4.0, 6.5], ['Abacate', 'frutas', $u::Kg, 6.0, 9.0],
            ['Maracujá', 'frutas', $u::Kg, 8.0, 12.0], ['Goiaba', 'frutas', $u::Kg, 6.0, 9.0],
            // Ovos & Laticínios
            ['Ovos Caipira', 'ovos-laticinios', $u::Duzia, 13.0, 18.0], ['Ovos de Codorna', 'ovos-laticinios', $u::Duzia, 8.0, 12.0],
            ['Queijo Minas Frescal', 'ovos-laticinios', $u::Unidade, 18.0, 26.0], ['Iogurte Natural', 'ovos-laticinios', $u::Litro, 12.0, 18.0],
        ];

        foreach ($pool as [$name, $catSlug, $unit, $min, $max]) {
            Product::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'category_id' => $categories[$catSlug] ?? null,
                    'name' => $name,
                    'unit' => $unit,
                    'price' => round(fake()->randomFloat(2, $min, $max), 2),
                    'description' => fake()->boolean(60) ? 'Colhido na semana, direto da horta.' : null,
                    'is_active' => fake()->boolean(92),
                ],
            );
        }

        return Product::active()->get();
    }

    /** @return \Illuminate\Support\Collection<int, DeliveryPoint> */
    private function seedPoints()
    {
        $extra = [
            ['Feira do Bairro Alto', 'Rua das Acácias, 300', -23.5580, -46.6720],
            ['Escola Municipal Girassol', 'Av. Brasil, 850', -23.5375, -46.6210],
            ['Igreja São Pedro', 'Praça São Pedro, 12', -23.5702, -46.6488],
            ['Padaria Pão Quente', 'Rua do Comércio, 77', -23.5488, -46.6155],
            ['Ponto do Mercado Verde', 'Alameda dos Flamboyants, 190', -23.5325, -46.6650],
        ];

        foreach ($extra as [$name, $address, $lat, $lng]) {
            DeliveryPoint::updateOrCreate(
                ['name' => $name],
                [
                    'address' => $address,
                    'reference' => fake()->boolean(50) ? 'Retirar com o responsável no local.' : null,
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'is_active' => true,
                ],
            );
        }

        return DeliveryPoint::active()->get();
    }

    /** @return \Illuminate\Support\Collection<int, User> */
    private function seedCustomers()
    {
        User::factory()
            ->count(self::CUSTOMERS)
            ->create(['role' => UserRole::Customer]);

        return User::where('role', UserRole::Customer->value)->get();
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Product>  $products
     * @param  \Illuminate\Support\Collection<int, DeliveryPoint>  $points
     * @param  \Illuminate\Support\Collection<int, User>  $customers
     */
    private function seedCycles($products, $points, $customers): void
    {
        $saturday = Carbon::now()->startOfDay()->next(Carbon::SATURDAY);

        // 1) Ciclos passados (entregues) — semanas anteriores.
        for ($k = self::PAST_CYCLES; $k >= 1; $k--) {
            $deliveryDate = $saturday->copy()->subWeeks($k);
            $cycle = $this->makeCycle($deliveryDate, CycleStatus::Delivered, $products, $points);
            $this->fillReservations($cycle, $customers, ReservationStatus::Delivered, 0.10);
        }

        // 2) Um ciclo cancelado (para variedade).
        $cancelled = $this->makeCycle($saturday->copy()->subWeeks(2)->addDays(1), CycleStatus::Cancelled, $products, $points);
        $this->fillReservations($cancelled, $customers, ReservationStatus::Cancelled, 1.0, [6, 12]);

        // 3) Dois ciclos fechados (em separação) — entrega muito próxima.
        for ($i = 1; $i <= 2; $i++) {
            $cycle = $this->makeCycle($saturday->copy()->subDays($i), CycleStatus::Closed, $products, $points);
            $this->fillReservations($cycle, $customers, ReservationStatus::Confirmed, 0.12);
        }

        // 4) O ciclo atual — ABERTO, aceitando reservas agora.
        $open = $this->makeCycle($saturday, CycleStatus::Open, $products, $points);
        $this->fillReservations($open, $customers, ReservationStatus::Confirmed, 0.08);

        // 5) Ciclos futuros — PROGRAMADOS (rascunho), ainda sem reservas.
        for ($k = 1; $k <= self::FUTURE_CYCLES; $k++) {
            $this->makeCycle($saturday->copy()->addWeeks($k), CycleStatus::Draft, $products, $points);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Product>  $products
     * @param  \Illuminate\Support\Collection<int, DeliveryPoint>  $points
     */
    private function makeCycle(Carbon $deliveryDate, CycleStatus $status, $products, $points): DeliveryCycle
    {
        $opensAt = $deliveryDate->copy()->subDays(6)->setTime(8, 0);
        $closesAt = $deliveryDate->copy()->subDay()->setTime(20, 0);

        // Ajusta a janela conforme o momento do ciclo.
        if ($status === CycleStatus::Open) {
            $opensAt = Carbon::now()->subDay();
            $closesAt = Carbon::now()->addDays(3);
        } elseif ($status === CycleStatus::Draft) {
            $opensAt = $deliveryDate->copy()->subDays(5)->setTime(8, 0);
            $closesAt = $deliveryDate->copy()->subDay()->setTime(20, 0);
        }

        $cycle = DeliveryCycle::create([
            'title' => 'Entrega — semana '.$deliveryDate->isoWeek().'/'.$deliveryDate->year,
            'delivery_date' => $deliveryDate->toDateString(),
            'order_opens_at' => $opensAt,
            'order_closes_at' => $closesAt,
            'status' => $status,
            'notes' => null,
        ]);

        // Produtos ofertados neste ciclo (subconjunto aleatório).
        $chosen = $products->shuffle()->take(rand(18, min(32, $products->count())));
        $rows = [];
        foreach ($chosen as $product) {
            $rows[] = [
                'delivery_cycle_id' => $cycle->id,
                'product_id' => $product->id,
                'quantity_available' => $product->unit->allowsFraction() ? rand(30, 140) : rand(20, 120),
                'price_override' => fake()->boolean(20) ? round((float) $product->price * fake()->randomFloat(2, 0.9, 1.15), 2) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('cycle_products')->insert($rows);

        // Pontos atendidos (3 a 6), com horário estimado na manhã da entrega.
        $chosenPoints = $points->shuffle()->take(rand(3, min(6, $points->count())));
        $hour = 8;
        $pointRows = [];
        foreach ($chosenPoints as $point) {
            $pointRows[] = [
                'delivery_cycle_id' => $cycle->id,
                'delivery_point_id' => $point->id,
                'scheduled_at' => $deliveryDate->copy()->setTime($hour, rand(0, 1) ? 0 : 30),
                'capacity' => fake()->boolean(25) ? rand(15, 40) : null,
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $hour += 1;
        }
        DB::table('cycle_delivery_points')->insert($pointRows);

        return $cycle->load('cycleProducts.product', 'cycleDeliveryPoints.deliveryPoint');
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $customers
     * @param  array{0:int,1:int}|null  $countRange
     */
    private function fillReservations(
        DeliveryCycle $cycle,
        $customers,
        ReservationStatus $activeStatus,
        float $cancelRatio,
        ?array $countRange = null,
    ): void {
        $stock = [];
        foreach ($cycle->cycleProducts as $cp) {
            $stock[$cp->id] = [
                'offered' => (float) $cp->quantity_available,
                'reserved' => 0.0,
                'price' => $cp->effectivePrice(),
                'name' => $cp->product->name,
                'unit' => $cp->product->unit,
                'product_id' => $cp->product_id,
            ];
        }
        $cpIds = array_keys($stock);
        $pointList = $cycle->cycleDeliveryPoints->all();
        if (empty($cpIds) || empty($pointList)) {
            return;
        }

        [$min, $max] = $countRange ?? self::RES_PER_ACTIVE_CYCLE;
        $total = rand($min, $max);

        for ($i = 0; $i < $total; $i++) {
            $isCancelled = fake()->boolean((int) round($cancelRatio * 100));
            $status = $isCancelled ? ReservationStatus::Cancelled : $activeStatus;
            $consumes = $status->isActive();

            $point = Arr::random($pointList);
            $itemsWanted = rand(2, 6);
            $picked = Arr::random($cpIds, min($itemsWanted, count($cpIds)));
            $picked = is_array($picked) ? $picked : [$picked];

            $items = [];
            $totalAmount = 0.0;
            foreach ($picked as $cpId) {
                $s = &$stock[$cpId];
                $remaining = $s['offered'] - $s['reserved'];
                if ($consumes && $remaining <= 0) {
                    continue;
                }
                $qty = $this->quantityForUnit($s['unit']);
                if ($consumes) {
                    $qty = min($qty, $remaining);
                    if ($qty <= 0) {
                        continue;
                    }
                    $s['reserved'] += $qty;
                }
                $lineTotal = round($s['price'] * $qty, 2);
                $totalAmount += $lineTotal;
                $items[] = [
                    'product_id' => $s['product_id'],
                    'cycle_product_id' => $cpId,
                    'product_name' => $s['name'],
                    'unit' => $s['unit']->value,
                    'unit_price' => $s['price'],
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                ];
                unset($s);
            }

            if (empty($items)) {
                continue;
            }

            $registered = fake()->boolean(55);
            $customer = $registered ? $customers->random() : null;
            $createdAt = $this->reservationTimestamp($cycle);

            $reservation = Reservation::make([
                'delivery_cycle_id' => $cycle->id,
                'cycle_delivery_point_id' => $point->id,
                'user_id' => $customer?->id,
                'guest_name' => $registered ? null : fake()->name(),
                'guest_email' => $registered ? null : (fake()->boolean(70) ? fake()->safeEmail() : null),
                'guest_phone' => $registered ? null : (fake()->boolean(80) ? fake()->numerify('(11) 9####-####') : null),
                'delivery_point_name' => $point->deliveryPoint->name,
                'status' => $status,
                'confirmation_code' => $this->uniqueCode(),
                'total_amount' => round($totalAmount, 2),
                'notes' => fake()->boolean(15) ? fake()->sentence(6) : null,
            ]);
            // Garante ao menos um contato para convidados.
            if (! $registered && ! $reservation->guest_email && ! $reservation->guest_phone) {
                $reservation->guest_phone = fake()->numerify('(11) 9####-####');
            }
            $reservation->created_at = $createdAt;
            $reservation->updated_at = $status === ReservationStatus::Delivered
                ? $cycle->delivery_date
                : $createdAt;
            $reservation->save();

            $reservation->items()->createMany($items);
        }
    }

    private function quantityForUnit(ProductUnit $unit): float
    {
        return match ($unit) {
            ProductUnit::Kg, ProductUnit::Litro => (float) Arr::random([0.5, 1.0, 1.0, 1.5, 2.0, 2.5, 3.0]),
            ProductUnit::Unidade => (float) rand(1, 6),
            ProductUnit::Maco => (float) rand(1, 3),
            ProductUnit::Duzia => (float) rand(1, 2),
            ProductUnit::Bandeja => (float) rand(1, 3),
        };
    }

    private function reservationTimestamp(DeliveryCycle $cycle): Carbon
    {
        $start = $cycle->order_opens_at->copy();
        $end = $cycle->order_closes_at->copy();
        if ($end->lessThanOrEqualTo($start)) {
            return $start;
        }
        $spanMinutes = max(1, $start->diffInMinutes($end));
        $ts = $start->copy()->addMinutes(rand(0, (int) $spanMinutes));

        return $ts->greaterThan(Carbon::now()) ? Carbon::now() : $ts;
    }

    private function uniqueCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (isset($this->usedCodes[$code]));
        $this->usedCodes[$code] = true;

        return $code;
    }
}
