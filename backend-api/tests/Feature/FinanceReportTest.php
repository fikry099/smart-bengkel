<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinanceReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_uses_paid_orders_and_sparepart_cost_for_financial_totals(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = Product::create([
            'sku' => 'SP-REPORT-1',
            'name' => 'Kampas Rem',
            'type' => 'sparepart',
            'cost_price' => 50000,
            'selling_price' => 100000,
            'stock' => 10,
        ]);
        $paidOrder = ServiceOrder::create([
            'order_code' => 'ORDER-PAID-1',
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Servis',
            'status' => 'COMPLETED',
            'total_amount' => 300000,
            'payment_method' => 'CASH',
            'amount_received' => 350000,
            'change_amount' => 50000,
            'paid_at' => now(),
        ]);
        OrderItem::create([
            'service_order_id' => $paidOrder->id,
            'product_id' => $product->id,
            'item_name' => $product->name,
            'item_type' => 'sparepart',
            'price' => 100000,
            'cost' => 100000,
            'quantity' => 2,
        ]);
        ServiceOrder::create([
            'order_code' => 'ORDER-UNPAID-1',
            'plate_number' => 'AB 4321 CD',
            'initial_complaint' => 'Servis belum lunas',
            'status' => 'READY_FOR_PICKUP',
            'total_amount' => 200000,
        ]);
        Expense::create([
            'title' => 'Listrik bengkel',
            'category' => 'Operasional',
            'amount' => 40000,
            'expense_date' => now()->toDateString(),
        ]);

        $this->getJson('/api/finance/report')
            ->assertOk()
            ->assertJsonPath('summary.total_income', 300000)
            ->assertJsonPath('summary.total_hpp', 100000)
            ->assertJsonPath('summary.total_expenses', 40000)
            ->assertJsonPath('summary.gross_profit', 200000)
            ->assertJsonPath('summary.net_profit', 160000)
            ->assertJsonCount(1, 'payments')
            ->assertJsonPath('payments.0.amount_received', '350000.00')
            ->assertJsonCount(1, 'expenses');
    }

    public function test_admin_can_record_an_expense_and_invalid_amount_is_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/finance/expenses', [
            'title' => 'Pembelian perlengkapan',
            'category' => 'Operasional',
            'amount' => 75000,
            'expense_date' => '2026-11-16',
            'notes' => 'Sarung tangan mekanik',
        ])->assertCreated()
            ->assertJsonPath('expense.title', 'Pembelian perlengkapan')
            ->assertJsonPath('expense.amount', '75000.00')
            ->assertJsonPath('expense.expense_date', '2026-11-16');

        $this->postJson('/api/finance/expenses', [
            'title' => 'Nominal tidak valid',
            'amount' => 0,
            'expense_date' => '2026-11-16',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount');
    }
}
