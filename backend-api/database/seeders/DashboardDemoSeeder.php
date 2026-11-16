<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\OrderItem;
use App\Models\ServiceOrder;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $demoCustomers = [
                ['name' => 'Pelanggan Demo 01', 'plate' => 'B 9001 DMO', 'vehicle' => 'Toyota Avanza 1.3'],
                ['name' => 'Pelanggan Demo 02', 'plate' => 'B 9002 DMO', 'vehicle' => 'Honda Brio Satya'],
                ['name' => 'Pelanggan Demo 03', 'plate' => 'B 9003 DMO', 'vehicle' => 'Mitsubishi Xpander'],
                ['name' => 'Pelanggan Demo 04', 'plate' => 'B 9004 DMO', 'vehicle' => 'Toyota Innova Reborn'],
                ['name' => 'Pelanggan Demo 05', 'plate' => 'B 9005 DMO', 'vehicle' => 'Suzuki Ertiga'],
                ['name' => 'Pelanggan Demo 06', 'plate' => 'B 9006 DMO', 'vehicle' => 'Daihatsu Xenia'],
                ['name' => 'Pelanggan Demo 07', 'plate' => 'B 9007 DMO', 'vehicle' => 'Honda Mobilio'],
                ['name' => 'Pelanggan Demo 08', 'plate' => 'B 9008 DMO', 'vehicle' => 'Toyota Calya'],
            ];

            $vehicles = [];
            foreach ($demoCustomers as $index => $demoCustomer) {
                $customer = Customer::updateOrCreate(
                    ['whatsapp_number' => sprintf('000000000%03d', $index + 1)],
                    [
                        'name' => $demoCustomer['name'],
                        'address' => 'Alamat contoh untuk data demo dashboard.',
                    ]
                );

                $vehicles[$index] = Vehicle::updateOrCreate(
                    ['plate_number' => $demoCustomer['plate']],
                    [
                        'customer_id' => $customer->id,
                        'brand_model' => $demoCustomer['vehicle'],
                    ]
                );
            }

            $itemSets = [
                [
                    ['name' => 'Scan & Analisa Engine', 'type' => 'service', 'price' => 150000],
                    ['name' => 'Filter Oli', 'type' => 'sparepart', 'price' => 65000],
                ],
                [
                    ['name' => 'Tune Up Basic Mobil Kecil', 'type' => 'service', 'price' => 200000],
                    ['name' => 'Air Aki', 'type' => 'sparepart', 'price' => 95000],
                ],
                [
                    ['name' => 'Cek Rem 4 Roda', 'type' => 'service', 'price' => 200000],
                    ['name' => 'Brake Pad Agya/Ayla', 'type' => 'sparepart', 'price' => 375000],
                ],
                [
                    ['name' => 'Vakum + Isi Freon AC', 'type' => 'service', 'price' => 150000],
                    ['name' => 'Freon AC R134a', 'type' => 'sparepart', 'price' => 120000],
                ],
                [
                    ['name' => 'Ganti Oli + Filter Oli', 'type' => 'service', 'price' => 25000],
                    ['name' => 'Oli Mesin 10W-40', 'type' => 'sparepart', 'price' => 350000],
                ],
                [
                    ['name' => 'Ganti Engine Mounting', 'type' => 'service', 'price' => 50000],
                    ['name' => 'Engine Mounting Avanza', 'type' => 'sparepart', 'price' => 450000],
                ],
                [
                    ['name' => 'Ganti Oli Transmisi Manual (MTF)', 'type' => 'service', 'price' => 50000],
                    ['name' => 'Oli Transmisi Manual', 'type' => 'sparepart', 'price' => 180000],
                ],
            ];

            $scenarios = [
                ['status' => 'INSPECTING', 'days_ago' => 0, 'time' => '08:10', 'customer' => 0, 'items' => null],
                ['status' => 'INSPECTED', 'days_ago' => 0, 'time' => '08:45', 'customer' => 1, 'items' => 0],
                ['status' => 'WAITING_ACC', 'days_ago' => 0, 'time' => '09:20', 'customer' => 2, 'items' => 1],
                ['status' => 'IN_PROGRESS', 'days_ago' => 0, 'time' => '09:55', 'customer' => 3, 'items' => 2],
                ['status' => 'READY_FOR_PICKUP', 'days_ago' => 0, 'time' => '10:25', 'customer' => 4, 'items' => 3],
                ['status' => 'COMPLETED', 'days_ago' => 0, 'time' => '10:50', 'customer' => 5, 'items' => 4, 'payment' => 'CASH'],
                ['status' => 'PENDING_ACC', 'days_ago' => 1, 'time' => '09:15', 'customer' => 6, 'items' => 5],
                ['status' => 'IN_PROGRESS', 'days_ago' => 1, 'time' => '10:40', 'customer' => 7, 'items' => 6],
                ['status' => 'COMPLETED', 'days_ago' => 1, 'time' => '14:20', 'customer' => 0, 'items' => 1, 'payment' => 'TRANSFER'],
                ['status' => 'READY', 'days_ago' => 2, 'time' => '09:35', 'customer' => 1, 'items' => 2],
                ['status' => 'COMPLETED', 'days_ago' => 2, 'time' => '13:10', 'customer' => 2, 'items' => 3, 'payment' => 'QRIS'],
                ['status' => 'QUEUED', 'days_ago' => 3, 'time' => '08:30', 'customer' => 3, 'items' => null],
                ['status' => 'COMPLETED', 'days_ago' => 3, 'time' => '15:45', 'customer' => 4, 'items' => 4, 'payment' => 'CASH'],
                ['status' => 'WAITING_ACC', 'days_ago' => 4, 'time' => '09:05', 'customer' => 5, 'items' => 5],
                ['status' => 'COMPLETED', 'days_ago' => 4, 'time' => '14:50', 'customer' => 6, 'items' => 6, 'payment' => 'TRANSFER'],
                ['status' => 'IN_PROGRESS', 'days_ago' => 5, 'time' => '10:15', 'customer' => 7, 'items' => 0],
                ['status' => 'COMPLETED', 'days_ago' => 5, 'time' => '16:35', 'customer' => 0, 'items' => 2, 'payment' => 'QRIS'],
                ['status' => 'CANCELLED', 'days_ago' => 6, 'time' => '11:20', 'customer' => 1, 'items' => 1],
                ['status' => 'COMPLETED', 'days_ago' => 6, 'time' => '14:05', 'customer' => 2, 'items' => 5, 'payment' => 'CASH'],
            ];

            $today = now()->startOfDay();

            foreach ($scenarios as $index => $scenario) {
                $createdAt = $today->copy()
                    ->subDays($scenario['days_ago'])
                    ->setTimeFromTimeString($scenario['time']);
                $vehicle = $vehicles[$scenario['customer']];
                $customer = $vehicle->customer;
                $items = $scenario['items'] === null
                    ? []
                    : $itemSets[$scenario['items']];
                $additionalCost = $items !== [] && $index % 4 === 0 ? 25000 : 0;
                $totalAmount = array_sum(array_column($items, 'price')) + $additionalCost;
                $isCompleted = $scenario['status'] === 'COMPLETED';
                $paymentMethod = $isCompleted ? $scenario['payment'] : null;
                $amountReceived = $isCompleted && $paymentMethod === 'CASH'
                    ? $totalAmount + 50000
                    : ($isCompleted ? $totalAmount : null);
                $paidAt = $isCompleted ? $createdAt->copy()->addMinutes(45) : null;

                $order = ServiceOrder::updateOrCreate(
                    ['order_code' => sprintf('DEMO-DASH-%03d', $index + 1)],
                    [
                        'vehicle_id' => $vehicle->id,
                        'customer_id' => $customer->id,
                        'plate_number' => $vehicle->plate_number,
                        'customer_address' => $customer->address,
                        'current_mileage_km' => 45000 + ($index * 1750),
                        'initial_complaint' => [
                            'Mesin terasa kurang bertenaga dan perlu diperiksa.',
                            'Ada bunyi pada roda saat melewati jalan tidak rata.',
                            'AC kurang dingin dan perlu pengecekan.',
                            'Kendaraan perlu servis berkala dan penggantian oli.',
                        ][$index % 4],
                        'inspection_notes' => $scenario['status'] === 'QUEUED'
                            ? null
                            : 'Pemeriksaan awal sudah dicatat oleh mekanik demo.',
                        'additional_notes' => 'Data simulasi dashboard; bukan transaksi pelanggan.',
                        'user_budget_limit' => 1500000,
                        'user_acc_notes' => in_array(
                            $scenario['status'],
                            ['IN_PROGRESS', 'READY_FOR_PICKUP', 'READY', 'COMPLETED'],
                            true
                        )
                            ? 'Disetujui pelanggan melalui WhatsApp (simulasi).'
                            : ($scenario['status'] === 'CANCELLED' ? 'Dibatalkan (simulasi).' : null),
                        'estimated_days' => 1,
                        'estimated_completion_date' => $createdAt->copy()->addDay(),
                        'approved_items' => null,
                        'queue_type' => $index % 2 === 0 ? 'onsite' : 'drop_off',
                        'status' => $scenario['status'],
                        'additional_cost' => $additionalCost,
                        'additional_cost_reason' => $additionalCost > 0
                            ? 'Biaya pemeriksaan tambahan (simulasi).'
                            : null,
                        'difficulty_surcharge' => 0,
                        'total_amount' => $totalAmount,
                        'payment_method' => $paymentMethod,
                        'amount_received' => $amountReceived,
                        'change_amount' => $isCompleted && $paymentMethod === 'CASH'
                            ? $amountReceived - $totalAmount
                            : 0,
                        'payment_reference' => $isCompleted && $paymentMethod !== 'CASH'
                            ? sprintf('DEMO-%s-%03d', $paymentMethod, $index + 1)
                            : null,
                        'paid_at' => $paidAt,
                    ]
                );

                $order->items()->delete();
                $createdItems = [];

                foreach ($items as $item) {
                    $createdItems[] = $order->items()->create([
                        'product_id' => null,
                        'item_name' => $item['name'],
                        'item_type' => $item['type'],
                        'price' => $item['price'],
                        'cost' => $item['price'],
                        'quantity' => 1,
                        'stock_deducted_quantity' => 0,
                        'subtotal' => $item['price'],
                    ]);
                }

                if (in_array(
                    $scenario['status'],
                    ['IN_PROGRESS', 'READY_FOR_PICKUP', 'READY', 'COMPLETED'],
                    true
                )) {
                    $order->approved_items = array_map(
                        static fn (OrderItem $item): array => [
                            'id' => $item->id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'is_approved' => true,
                        ],
                        $createdItems
                    );
                    $order->save();
                }

                $order->forceFill([
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ])->saveQuietly();
            }
        });
    }
}
