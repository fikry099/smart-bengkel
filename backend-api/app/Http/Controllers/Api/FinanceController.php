<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function report()
    {
        $paidOrders = ServiceOrder::query()
            ->where('status', 'COMPLETED')
            ->whereNotNull('paid_at')
            ->whereNotNull('payment_method');

        $totalIncome = (clone $paidOrders)->sum('total_amount');
        $totalHpp = DB::table('order_items')
            ->join('service_orders', 'service_orders.id', '=', 'order_items.service_order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('service_orders.status', 'COMPLETED')
            ->whereNotNull('service_orders.paid_at')
            ->whereNotNull('service_orders.payment_method')
            ->where('order_items.item_type', 'sparepart')
            ->sum(DB::raw('products.cost_price * order_items.quantity'));
        $totalExpenses = Expense::sum('amount');

        $payments = (clone $paidOrders)
            ->select([
                'id',
                'order_code',
                'plate_number',
                'total_amount',
                'payment_method',
                'amount_received',
                'change_amount',
                'paid_at',
            ])
            ->orderByDesc('paid_at')
            ->limit(100)
            ->get();

        return response()->json([
            'summary' => [
                'total_income' => round((float) $totalIncome, 2),
                'total_hpp' => round((float) $totalHpp, 2),
                'total_expenses' => round((float) $totalExpenses, 2),
                'gross_profit' => round((float) $totalIncome - (float) $totalHpp, 2),
                'net_profit' => round((float) $totalIncome - (float) $totalHpp - (float) $totalExpenses, 2),
            ],
            'payments' => $payments,
            'expenses' => Expense::query()
                ->orderByDesc('expense_date')
                ->orderByDesc('id')
                ->limit(100)
                ->get(),
        ]);
    }

    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'amount' => 'required|numeric|min:0.01|max:9999999999.99',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense = Expense::create($validated);

        return response()->json([
            'message' => 'Pengeluaran berhasil dicatat.',
            'expense' => $expense,
        ], 201);
    }
}
