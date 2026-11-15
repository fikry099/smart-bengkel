<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'brand',
        'image',
        'type',
        'category_id', 
        'cost_price',
        'selling_price',
        'stock',
        'min_stock',
        'location_rack',
        'is_fast_moving', 
        'is_active',
    ];

    protected $casts = [
        'cost_price'     => 'float',
        'selling_price'  => 'float',
        'stock'          => 'integer',
        'min_stock'      => 'integer',
        'is_fast_moving' => 'boolean',
        'is_active'      => 'boolean',
    ];

    // Relasi Many-to-One (Product milik satu Category)
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->where('type', 'sparepart')
                     ->whereColumn('stock', '<=', 'min_stock');
    }
}