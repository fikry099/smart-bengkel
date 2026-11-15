<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\ServiceOrder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReceptionController extends Controller
{
    public function checkIn(Request $request)
    {
        // 1. Validasi Payload dari Frontend React
        $validated = $request->validate([
            'plate_number'        => 'required|string',
            'customer_name'       => 'required|string',
            'whatsapp_number'     => 'required|string',
            'customer_address'    => 'nullable|string',
            'vehicle_brand_model' => 'required|string',
            'current_mileage_km'  => 'nullable|numeric',
            'initial_complaint'   => 'required|string',
            'queue_type'          => 'required|in:onsite,drop_off',
            'initial_items'       => 'nullable|array',
            'initial_items.*.product_id' => 'nullable|integer|exists:products,id',
            'initial_items.*.name'       => 'nullable|string',
            'initial_items.*.type'       => 'nullable|string',
            'initial_items.*.price'      => 'nullable|numeric',
            'initial_items.*.quantity'   => 'nullable|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $formattedPlate = strtoupper(trim($validated['plate_number']));
            $customerAddress = $validated['customer_address'] ?? null;

            // 2. Simpan / Update Data Pelanggan (Termasuk address)
            $customer = Customer::firstOrCreate(
                ['whatsapp_number' => $validated['whatsapp_number']],
                [
                    'name'    => $validated['customer_name'],
                    'address' => $customerAddress, // <-- DITAMBAHKAN
                ]
            );

            // Update jika ada perubahan nama atau alamat
            $updateData = [];
            if ($customer->name !== $validated['customer_name']) {
                $updateData['name'] = $validated['customer_name'];
            }
            if (!empty($customerAddress) && $customer->address !== $customerAddress) {
                $updateData['address'] = $customerAddress;
            }
            if (!empty($updateData)) {
                $customer->update($updateData);
            }

            // 3. Simpan / Update Data Kendaraan
            $vehicle = Vehicle::firstOrCreate(
                ['plate_number' => $formattedPlate],
                [
                    'customer_id' => $customer->id,
                    'brand_model' => $validated['vehicle_brand_model'],
                ]
            );

            if ($vehicle->brand_model !== $validated['vehicle_brand_model']) {
                $vehicle->update(['brand_model' => $validated['vehicle_brand_model']]);
            }

            // 4. Hitung Total Estimasi Biaya Awal
            $initialItems = $validated['initial_items'] ?? [];
            $totalAmount = 0;

            foreach ($initialItems as $index => $item) {
                $itemPrice = floatval($item['price'] ?? 0);
                $itemQty = intval($item['quantity'] ?? 1);

                if (! empty($item['product_id'])) {
                    $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                    if ($product->type === 'sparepart' && $itemQty > (int) $product->stock) {
                        throw ValidationException::withMessages([
                            "initial_items.{$index}.quantity" => [
                                "Stok {$product->name} tidak cukup. Tersedia {$product->stock}, dibutuhkan {$itemQty}.",
                            ],
                        ]);
                    }
                }

                $totalAmount += ($itemPrice * $itemQty);
            }

            // 5. Generate Kode Order Unik
            $orderCode = 'BAS-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            // 6. Buat Tiket ServiceOrder Baru (Termasuk customer_address)
            $order = ServiceOrder::create([
                'order_code'           => $orderCode,
                'vehicle_id'           => $vehicle->id,
                'customer_id'          => $customer->id,
                'plate_number'         => $formattedPlate,
                'customer_address'     => $customerAddress, // <-- DITAMBAHKAN
                'current_mileage_km'   => $validated['current_mileage_km'] ?? null,
                'initial_complaint'    => $validated['initial_complaint'],
                'queue_type'           => $validated['queue_type'],
                'status'               => 'QUEUED',
                'difficulty_surcharge' => 0,
                'total_amount'         => $totalAmount,
            ]);

            // 7. Simpan Detail Item ke Relasi OrderItem (Tabel order_items)
            if (!empty($initialItems)) {
                foreach ($initialItems as $item) {
                    $price = floatval($item['price'] ?? 0);
                    $qty = intval($item['quantity'] ?? 1);

                    $order->items()->create([
                        'product_id' => $item['product_id'] ?? null,
                        'item_name'  => $item['name'] ?? 'Item Tanpa Nama',
                        'item_type'  => $item['type'] ?? 'sparepart',
                        'price'      => $price,
                        'cost'       => $price,
                        'quantity'   => $qty,
                        'subtotal'   => $price * $qty,
                    ]);
                }
            }

            return response()->json([
                'message'    => 'Kendaraan berhasil masuk antrean pemeriksaan.',
                'order_code' => $order->order_code,
                'order'      => $order->load(['customer', 'vehicle', 'items']),
            ], 201);
        });
    }
}