<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';

    protected $fillable = [
        'service_order_id',
        'product_id',
        'item_name',
        'item_type',
        'price',
        'cost',
        'quantity',
        'stock_deducted_quantity',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_deducted_quantity' => 'integer',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'service_order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}