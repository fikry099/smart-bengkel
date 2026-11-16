<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WorkshopController extends Controller
{
    // 1. Ambil daftar antrean servis aktif
    public function index()
    {
        $orders = ServiceOrder::with(['customer', 'vehicle', 'items'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'orders' => $orders
        ]);
    }

    // Ambil detail single order
    public function show($id)
    {
        $order = ServiceOrder::with(['customer', 'vehicle', 'items'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'order'  => $order
        ]);
    }

    // 2. Tambah item diagnosa / sparepart baru (Otomatis akumulasi jika item/product_id sudah ada)
    public function addItem(Request $request, $orderId)
    {
        $validated = $request->validate([
            'item_name'  => 'required|string',
            'cost'       => 'nullable|numeric|min:0',
            'price'      => 'nullable|numeric|min:0',
            'quantity'   => 'nullable|integer|min:1',
            'item_type'  => 'nullable|string',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);

        return DB::transaction(function () use ($validated, $orderId) {
            $order = ServiceOrder::lockForUpdate()->findOrFail($orderId);
            $this->ensureOrderCanBeEdited($order);
            $finalPrice = $validated['price'] ?? $validated['cost'] ?? 0;
            $addQty = $validated['quantity'] ?? 1;

            // Cek apakah item dengan product_id atau nama & tipe yang sama sudah ada di order ini
            $existingItem = null;
            if (!empty($validated['product_id'])) {
                $existingItem = $order->items()->where('product_id', $validated['product_id'])->first();
            }

            if (!$existingItem) {
                $existingItem = $order->items()
                    ->where('item_name', $validated['item_name'])
                    ->where('item_type', $validated['item_type'] ?? 'sparepart')
                    ->first();
            }

            if (! empty($validated['product_id'])) {
                $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
                $existingQuantity = $existingItem ? (int) $existingItem->quantity : 0;
                $alreadyDeducted = $existingItem ? (int) $existingItem->stock_deducted_quantity : 0;
                $this->validateSparepartAvailability($product, $existingQuantity + $addQty, $alreadyDeducted);
            }

            if ($existingItem) {
                // Akumulasikan kuantitas item yang sudah ada
                $existingItem->increment('quantity', $addQty);
            } else {
                // Buat item baru jika belum ada
                $order->items()->create([
                    'product_id' => $validated['product_id'] ?? null,
                    'item_name'  => $validated['item_name'],
                    'item_type'  => $validated['item_type'] ?? 'sparepart',
                    'cost'       => $finalPrice,
                    'price'      => $finalPrice,
                    'quantity'   => $addQty,
                ]);
            }

            $order->recalculateTotal();

            return response()->json([
                'message' => 'Item perbaikan berhasil diperbarui.',
                'order'   => $order->load(['customer', 'vehicle', 'items'])
            ]);
        });
    }

    // 3. Update kuantitas item perbaikan yang sudah ada
    public function updateItem(Request $request, $orderId, $itemId)
    {
        $validated = $request->validate([
            'quantity'  => 'required|integer|min:1',
            'item_name' => 'nullable|string',
            'cost'      => 'nullable|numeric|min:0',
            'price'     => 'nullable|numeric|min:0',
            'item_type' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $orderId, $itemId) {
            $order = ServiceOrder::lockForUpdate()->findOrFail($orderId);
            $this->ensureOrderCanBeEdited($order);
            $item = OrderItem::where('service_order_id', $orderId)
                ->where('id', $itemId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($item->product_id && $validated['quantity'] > $item->quantity) {
                $product = Product::query()->lockForUpdate()->find($item->product_id);
                if ($product) {
                    $this->validateSparepartAvailability(
                        $product,
                        $validated['quantity'],
                        (int) $item->stock_deducted_quantity
                    );
                }
            }

            $finalPrice = $validated['price'] ?? $validated['cost'] ?? $item->price;

            $item->update([
                'quantity'  => $validated['quantity'],
                'cost'      => $finalPrice,
                'price'     => $finalPrice,
                'item_name' => $validated['item_name'] ?? $item->item_name,
                'item_type' => $validated['item_type'] ?? $item->item_type,
            ]);

            $order->recalculateTotal();

            return response()->json([
                'message' => 'Kuantitas item perbaikan berhasil diperbarui.',
                'order'   => $order->load(['customer', 'vehicle', 'items'])
            ]);
        });
    }

    // 4. Hapus item diagnosa
    public function deleteItem($orderId, $itemId)
    {
        return DB::transaction(function () use ($orderId, $itemId) {
            $order = ServiceOrder::lockForUpdate()->findOrFail($orderId);
            $this->ensureOrderCanBeEdited($order);
            $item = OrderItem::where('service_order_id', $orderId)
                ->where('id', $itemId)
                ->lockForUpdate()
                ->firstOrFail();
            
            if (! in_array($order->status, ['COMPLETED', 'CANCELLED'], true)) {
                $this->syncItemStockDeduction($item, 0);
            }
            $item->delete();
            $order->recalculateTotal();

            return response()->json([
                'message' => 'Item perbaikan berhasil dihapus.',
                'order'   => $order->load(['customer', 'vehicle', 'items'])
            ]);
        });
    }

    // 5. Update Biaya Tambahan Khusus (Nominal + Alasan)
    public function updateAdditionalCost(Request $request, $orderId)
    {
        $validated = $request->validate([
            'additional_cost'        => 'required|numeric|min:0',
            'additional_cost_reason' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $orderId) {
            $order = ServiceOrder::lockForUpdate()->findOrFail($orderId);
            $this->ensureOrderCanBeEdited($order);
            $order->additional_cost = $validated['additional_cost'];
            $order->additional_cost_reason = $validated['additional_cost_reason'] ?? null;
            $order->recalculateTotal();

            return response()->json([
                'message' => 'Biaya tambahan berhasil diperbarui.',
                'order'   => $order->load(['customer', 'vehicle', 'items'])
            ]);
        });
    }

    // 6. Update Catatan Inspeksi / Kerusakan Tambahan Mekanik
    public function updateNotes(Request $request, $orderId)
    {
        $validated = $request->validate([
            'additional_notes' => 'nullable|string',
        ]);

        $order = ServiceOrder::findOrFail($orderId);
        $order->additional_notes = $validated['additional_notes'];
        $order->save();

        return response()->json([
            'message' => 'Catatan inspeksi berhasil diperbarui.',
            'order'   => $order->load(['customer', 'vehicle', 'items'])
        ]);
    }

    // 7. Update Status Pengerjaan
    public function updateStatus(Request $request, $orderId)
    {
        $validated = $request->validate([
            'status' => 'required|in:QUEUED,INSPECTING,INSPECTED,PENDING_ACC,WAITING_ACC,IN_PROGRESS,READY_FOR_PICKUP,READY,COMPLETED,CANCELLED',
        ]);

        return DB::transaction(function () use ($validated, $orderId) {
            $order = ServiceOrder::with('items')->lockForUpdate()->findOrFail($orderId);

            if ($validated['status'] === 'COMPLETED') {
                return response()->json([
                    'message' => 'Selesaikan order melalui proses pembayaran.',
                ], 422);
            }

            if ($validated['status'] === 'IN_PROGRESS') {
                return response()->json([
                    'message' => 'Catat persetujuan WhatsApp melalui proses ACC sebelum memulai pengerjaan.',
                ], 422);
            }

            if (
                in_array($order->status, ['READY_FOR_PICKUP', 'READY'], true)
                && ! in_array($validated['status'], [$order->status, 'CANCELLED'], true)
            ) {
                return response()->json([
                    'message' => 'Order yang menunggu pembayaran tidak dapat dikembalikan ke tahap sebelumnya.',
                ], 422);
            }

            if (
                in_array($order->status, ['COMPLETED', 'CANCELLED'], true)
                && $validated['status'] !== $order->status
            ) {
                return response()->json([
                    'message' => 'Order yang sudah ditutup tidak dapat diubah statusnya.',
                ], 422);
            }

            if (
                in_array($validated['status'], ['READY_FOR_PICKUP', 'READY'], true)
                && $order->status !== 'IN_PROGRESS'
                && $order->status !== $validated['status']
            ) {
                return response()->json([
                    'message' => 'Order harus sedang dikerjakan sebelum masuk tahap menunggu pembayaran.',
                ], 422);
            }

            if (
                $validated['status'] === 'CANCELLED'
                && ! in_array($order->status, ['COMPLETED', 'CANCELLED'], true)
            ) {
                $this->restoreOrderStock($order);
            }

            $order->status = $validated['status'];
            $order->save();

            return response()->json([
                'message' => 'Status pengerjaan berhasil diperbarui.',
                'order'   => $order->load(['customer', 'vehicle', 'items'])
            ]);
        });
    }

    public function recordPayment(Request $request, $orderId)
    {
        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['CASH', 'TRANSFER', 'QRIS'])],
            'amount_received' => 'required|numeric|min:0|max:9999999999.99',
            'payment_reference' => 'nullable|string|max:100',
        ]);

        return DB::transaction(function () use ($validated, $orderId) {
            $order = ServiceOrder::query()->lockForUpdate()->findOrFail($orderId);

            if (! in_array($order->status, ['READY_FOR_PICKUP', 'READY'], true) || $order->paid_at) {
                return response()->json([
                    'message' => 'Order tidak berada pada tahap menunggu pembayaran.',
                ], 422);
            }

            $amountDueCents = (int) round((float) $order->total_amount * 100);
            $amountReceivedCents = (int) round((float) $validated['amount_received'] * 100);

            if ($validated['payment_method'] === 'CASH' && $amountReceivedCents < $amountDueCents) {
                throw ValidationException::withMessages([
                    'amount_received' => ['Uang yang diterima kurang dari total yang harus dibayar.'],
                ]);
            }

            if ($validated['payment_method'] !== 'CASH' && $amountReceivedCents !== $amountDueCents) {
                throw ValidationException::withMessages([
                    'amount_received' => ['Nominal transfer atau QRIS harus sama dengan total pembayaran.'],
                ]);
            }

            $order->payment_method = $validated['payment_method'];
            $order->amount_received = number_format($amountReceivedCents / 100, 2, '.', '');
            $order->change_amount = number_format(
                max(0, $amountReceivedCents - $amountDueCents) / 100,
                2,
                '.',
                ''
            );
            $order->payment_reference = $validated['payment_method'] === 'CASH'
                ? null
                : ($validated['payment_reference'] ?? null);
            $order->paid_at = now();
            $order->status = 'COMPLETED';
            $order->save();

            return response()->json([
                'message' => 'Pembayaran berhasil dicatat dan order telah diselesaikan.',
                'order' => $order->load(['customer', 'vehicle', 'items']),
            ]);
        });
    }

    // 8. Submit Persetujuan ACC Pelanggan (Admin Input)
    public function submitCustomerAcc(Request $request, $id)
    {
        $validated = $request->validate([
            'status'          => 'required|in:IN_PROGRESS,CANCELLED',
            'user_acc_notes'  => 'nullable|string',
            'estimated_hours' => 'nullable|integer|min:1',
            'approved_items'  => 'required|array',
            'approved_items.*.id'          => [
                'required',
                'integer',
                Rule::exists('order_items', 'id')->where('service_order_id', $id),
            ],
            'approved_items.*.is_approved' => 'required|boolean',
            'approved_items.*.quantity'    => 'nullable|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $order = ServiceOrder::with('items')->lockForUpdate()->findOrFail($id);

            if (! in_array($order->status, ['PENDING_ACC', 'WAITING_ACC'], true)) {
                return response()->json([
                    'message' => 'Order belum berada pada status menunggu persetujuan.',
                ], 422);
            }

            if ($validated['status'] === 'CANCELLED') {
                $this->restoreOrderStock($order);
                $order->status = 'CANCELLED';
                $order->user_acc_notes = $validated['user_acc_notes'] ?? 'Dibatalkan oleh pelanggan.';
                $order->save();

                return response()->json([
                    'message' => 'Pengerjaan servis berhasil dibatalkan.',
                    'order'   => $order->load(['customer', 'vehicle', 'items'])
                ]);
            }

            $approvedList = [];
            foreach ($validated['approved_items'] as $itemData) {
                $item = OrderItem::where('service_order_id', $order->id)
                    ->where('id', $itemData['id'])
                    ->firstOrFail();

                if ($itemData['is_approved']) {
                    $item->quantity = $itemData['quantity'] ?? $item->quantity;
                    $item->save();
                    $this->syncItemStockDeduction($item, $item->quantity);

                    $approvedList[] = [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'is_approved' => true
                    ];
                } else {
                    $this->syncItemStockDeduction($item, 0);
                    $approvedList[] = [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'is_approved' => false
                    ];
                    $item->delete();
                }
            }

            $hours = intval($validated['estimated_hours'] ?? 24);
            $completionDate = now()->addHours($hours);

            $order->status = 'IN_PROGRESS';
            $order->user_acc_notes = $validated['user_acc_notes'] ?? null;
            $order->estimated_days = ceil($hours / 24);
            $order->estimated_completion_date = $completionDate;
            $order->approved_items = $approvedList;
            $order->recalculateTotal();

            return response()->json([
                'message' => 'Persetujuan pelanggan berhasil disimpan. Status pengerjaan diperbarui ke IN_PROGRESS.',
                'order'   => $order->load(['customer', 'vehicle', 'items'])
            ]);
        });
    }

    private function restoreOrderStock(ServiceOrder $order): void
    {
        foreach ($order->items as $item) {
            $this->syncItemStockDeduction($item, 0);
        }
    }

    private function ensureOrderCanBeEdited(ServiceOrder $order): void
    {
        if (in_array($order->status, ['READY_FOR_PICKUP', 'READY', 'COMPLETED', 'CANCELLED'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Order yang sudah menunggu pembayaran atau ditutup tidak dapat diubah.'],
            ]);
        }
    }

    private function validateSparepartAvailability(
        Product $product,
        int $requestedQuantity,
        int $alreadyDeductedQuantity = 0
    ): void {
        if ($product->type !== 'sparepart') {
            return;
        }

        $availableStock = (int) $product->stock + $alreadyDeductedQuantity;
        if ($requestedQuantity > $availableStock) {
            throw ValidationException::withMessages([
                'product_id' => [
                    "Stok {$product->name} tidak cukup. Tersedia {$availableStock}, dibutuhkan {$requestedQuantity}.",
                ],
            ]);
        }
    }

    private function syncItemStockDeduction(OrderItem $item, int $targetQuantity): void
    {
        $deductedQuantity = (int) $item->stock_deducted_quantity;
        $product = $item->product_id
            ? Product::query()->lockForUpdate()->find($item->product_id)
            : null;

        if ($deductedQuantity > 0 && ! $product) {
            throw ValidationException::withMessages([
                'stock' => ['Stok item tidak dapat dikembalikan karena produk terkait tidak ditemukan.'],
            ]);
        }

        if (! $product || $item->item_type !== 'sparepart' || $product->type !== 'sparepart') {
            $targetQuantity = 0;
        }

        $difference = $targetQuantity - $deductedQuantity;

        if ($difference > 0) {
            if ($product->stock < $difference) {
                throw ValidationException::withMessages([
                    'approved_items' => [
                        "Stok {$product->name} tidak cukup. Tersedia {$product->stock}, tambahan yang dibutuhkan {$difference}.",
                    ],
                ]);
            }

            $product->decrement('stock', $difference);
        } elseif ($difference < 0) {
            $product->increment('stock', abs($difference));
        }

        if ($item->stock_deducted_quantity !== $targetQuantity) {
            $item->stock_deducted_quantity = $targetQuantity;
            $item->save();
        }
    }
}