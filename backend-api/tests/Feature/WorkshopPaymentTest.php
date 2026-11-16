<?php

namespace Tests\Feature;

use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkshopPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_cash_payment_records_received_amount_change_and_completes_order(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $order = $this->createReadyOrder();

        $this->postJson("/api/workshop/orders/{$order->id}/payment", [
            'payment_method' => 'CASH',
            'amount_received' => 250000,
        ])->assertOk()
            ->assertJsonPath('order.status', 'COMPLETED')
            ->assertJsonPath('order.payment_method', 'CASH');

        $order->refresh();
        $this->assertSame('250000.00', $order->amount_received);
        $this->assertSame('10000.00', $order->change_amount);
        $this->assertNull($order->payment_reference);
        $this->assertNotNull($order->paid_at);
    }

    public function test_transfer_and_qris_accept_only_the_full_amount(): void
    {
        Sanctum::actingAs(User::factory()->create());

        foreach (['TRANSFER', 'QRIS'] as $method) {
            $order = $this->createReadyOrder();

            $this->postJson("/api/workshop/orders/{$order->id}/payment", [
                'payment_method' => $method,
                'amount_received' => 240000,
                'payment_reference' => "{$method}-REF-1",
            ])->assertOk()
                ->assertJsonPath('order.status', 'COMPLETED')
                ->assertJsonPath('order.payment_method', $method);

            $this->assertSame("{$method}-REF-1", $order->fresh()->payment_reference);
            $this->assertSame('0.00', $order->fresh()->change_amount);
        }
    }

    public function test_underpayment_is_rejected_without_completing_order(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $order = $this->createReadyOrder();

        $this->postJson("/api/workshop/orders/{$order->id}/payment", [
            'payment_method' => 'CASH',
            'amount_received' => 239999,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount_received');

        $this->assertSame('READY_FOR_PICKUP', $order->fresh()->status);
        $this->assertNull($order->fresh()->payment_method);
        $this->assertNull($order->fresh()->paid_at);
    }

    public function test_non_cash_payment_must_match_the_total_exactly(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $order = $this->createReadyOrder();

        $this->postJson("/api/workshop/orders/{$order->id}/payment", [
            'payment_method' => 'TRANSFER',
            'amount_received' => 239000,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('amount_received');

        $this->assertSame('READY_FOR_PICKUP', $order->fresh()->status);
    }

    public function test_only_orders_waiting_for_payment_can_be_paid_and_completed_through_payment(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $order = ServiceOrder::create([
            'order_code' => uniqid('ORDER-'),
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Test complaint',
            'status' => 'IN_PROGRESS',
            'total_amount' => 240000,
        ]);

        $this->postJson("/api/workshop/orders/{$order->id}/payment", [
            'payment_method' => 'CASH',
            'amount_received' => 240000,
        ])->assertUnprocessable();

        $this->patchJson("/api/workshop/orders/{$order->id}/status", [
            'status' => 'COMPLETED',
        ])->assertUnprocessable();

        $this->assertSame('IN_PROGRESS', $order->fresh()->status);
    }

    public function test_payment_cannot_be_recorded_twice(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $order = $this->createReadyOrder();

        $payload = [
            'payment_method' => 'CASH',
            'amount_received' => 240000,
        ];

        $this->postJson("/api/workshop/orders/{$order->id}/payment", $payload)->assertOk();
        $this->postJson("/api/workshop/orders/{$order->id}/payment", $payload)->assertUnprocessable();

        $this->assertSame('COMPLETED', $order->fresh()->status);
    }

    private function createReadyOrder(): ServiceOrder
    {
        return ServiceOrder::create([
            'order_code' => uniqid('ORDER-'),
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Test complaint',
            'status' => 'READY_FOR_PICKUP',
            'total_amount' => 240000,
        ]);
    }
}
