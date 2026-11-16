<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'vehicle_id',
        'customer_id',
        'plate_number',
        'customer_address',
        'current_mileage_km',
        'initial_complaint',
        'inspection_notes',
        'additional_notes',
        'user_budget_limit',
        'user_acc_notes',
        'estimated_days',
        'estimated_completion_date',
        'approved_items',
        'queue_type',
        'status',
        'additional_cost',
        'additional_cost_reason',
        'difficulty_surcharge',
        'total_amount',
        'payment_method',
        'amount_received',
        'change_amount',
        'payment_reference',
        'paid_at',
    ];

    protected $casts = [
        'approved_items' => 'array',
        'estimated_days' => 'integer',
        'estimated_completion_date' => 'datetime',
        'user_budget_limit' => 'decimal:2',
        'additional_cost' => 'decimal:2',
        'difficulty_surcharge' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_received' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'service_order_id');
    }

    // Hitung ulang total estimasi / biaya akhir
    public function recalculateTotal()
    {
        $itemsTotal = $this->items->sum(function ($item) {
            if (isset($item->cost) && $item->cost > 0) {
                return $item->cost;
            }
            if (isset($item->subtotal) && $item->subtotal > 0) {
                return $item->subtotal;
            }
            return ($item->price ?? 0) * ($item->quantity ?? 1);
        });

        $extraCost = floatval($this->additional_cost ?? $this->difficulty_surcharge ?? 0);
        $this->total_amount = $itemsTotal + $extraCost;
        $this->save();
    }
}