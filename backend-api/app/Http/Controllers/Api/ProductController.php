<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Pencarian multi-kolom
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(sku) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(brand) LIKE ?', ["%{$search}%"])
                  ->orWhereHas('category', function($catQuery) use ($search) {
                      $catQuery->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                  });
            });
        }

        if ($request->filled('type') && in_array($request->type, ['sparepart', 'service'])) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_fast_moving')) {
            $query->where('is_fast_moving', filter_var($request->is_fast_moving, FILTER_VALIDATE_BOOLEAN));
        }

        // Server-Side Pagination (Default 10 per halaman atau sesuai input per_page)
        $perPage = $request->input('per_page', 10);
        $products = $query->orderBy('name', 'asc')->paginate($perPage);

        // Agregasi Statistik dalam 1 Query Tunggal
        $stats = Product::selectRaw("
            COUNT(*) as total_items,
            COUNT(CASE WHEN type = 'sparepart' THEN 1 END) as total_sparepart,
            COUNT(CASE WHEN type = 'service' THEN 1 END) as total_service,
            COUNT(CASE WHEN type = 'sparepart' AND stock <= COALESCE(min_stock, 0) THEN 1 END) as low_stock_count
        ")->first();

        return response()->json([
            'status'   => 'success',
            'stats'    => $stats,
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'from'         => $products->firstItem(),
                'to'           => $products->lastItem(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku'            => 'required|string|max:100|unique:products,sku',
            'name'           => 'required|string|max:255',
            'brand'          => 'nullable|string|max:100',
            'image'          => 'nullable|string',
            'type'           => 'required|in:sparepart,service',
            'category_id'    => 'nullable|exists:categories,id',
            'cost_price'     => 'required|numeric|min:0',
            'selling_price'  => 'required|numeric|min:0',
            'stock'          => 'required_if:type,sparepart|numeric|min:0',
            'min_stock'      => 'nullable|numeric|min:0',
            'location_rack'  => 'nullable|string|max:50',
            'is_fast_moving' => 'nullable|boolean',
        ]);

        if ($validated['type'] === 'service') {
            $validated['stock'] = 0;
            $validated['min_stock'] = 0;
        } else {
            $validated['min_stock'] = $validated['min_stock'] ?? 0;
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Katalog produk berhasil ditambahkan.',
            'product' => $product->load('category'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'sku'            => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'name'           => 'required|string|max:255',
            'brand'          => 'nullable|string|max:100',
            'image'          => 'nullable|string',
            'type'           => 'required|in:sparepart,service',
            'category_id'    => 'nullable|exists:categories,id',
            'cost_price'     => 'required|numeric|min:0',
            'selling_price'  => 'required|numeric|min:0',
            'stock'          => 'required_if:type,sparepart|numeric|min:0',
            'min_stock'      => 'nullable|numeric|min:0',
            'location_rack'  => 'nullable|string|max:50',
            'is_fast_moving' => 'nullable|boolean',
        ]);

        if ($product->type !== $validated['type'] && $this->hasActiveStockDeduction($product->id)) {
            return response()->json([
                'message' => 'Tipe produk tidak dapat diubah selama stoknya terkait order aktif.',
            ], 422);
        }

        if ($validated['type'] === 'service') {
            $validated['stock'] = 0;
            $validated['min_stock'] = 0;
        } else {
            $validated['min_stock'] = $validated['min_stock'] ?? 0;
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Data katalog berhasil diperbarui.',
            'product' => $product->load('category'),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($this->hasActiveStockDeduction($product->id)) {
            return response()->json([
                'message' => 'Produk tidak dapat dihapus selama stoknya terkait order aktif.',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus dari katalog.',
        ]);
    }

    public function restock(Request $request, $id)
    {
        $validated = $request->validate([
            'additional_stock' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($id);

        if ($product->type !== 'sparepart') {
            return response()->json([
                'message' => 'Item jasa tidak memerlukan manajemen stok.',
            ], 422);
        }

        $product->increment('stock', $validated['additional_stock']);

        return response()->json([
            'message' => 'Stok berhasil ditambahkan.',
            'product' => $product->fresh()->load('category'),
        ]);
    }

    private function hasActiveStockDeduction(int $productId): bool
    {
        return OrderItem::query()
            ->where('product_id', $productId)
            ->where('stock_deducted_quantity', '>', 0)
            ->whereHas('serviceOrder', function ($query) {
                $query->whereNotIn('status', ['COMPLETED', 'CANCELLED']);
            })
            ->exists();
    }
}