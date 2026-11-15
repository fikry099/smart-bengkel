<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Mengambil daftar kategori beserta filter opsional berdasarkan type produk/jasa.
     */
    public function index(Request $request)
    {
        $query = Category::where('is_active', true);

        // Jika frontend meminta kategori khusus sparepart atau service
        if ($request->filled('type')) {
            $query->whereHas('products', function ($q) use ($request) {
                $q->where('type', $request->type);
            });
        }

        $categories = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'status'     => 'success',
            'categories' => $categories,
        ]);
    }
}