<?php

namespace Tests\Feature;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkshopInventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_is_deducted_only_when_admin_records_approval(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $sparepart = $this->createProduct('PART-1', 5);
        $service = $this->createProduct('SERVICE-1', 0, 'service');
        $order = $this->createOrder();
        $partItem = $this->addItem($order, $sparepart, 2);
        $serviceItem = $this->addItem($order, $service, 1, 'service');

        $this->assertSame(5, $sparepart->fresh()->stock);

        $this->submitApproval($order, [
            ['id' => $partItem->id, 'is_approved' => true, 'quantity' => 2],
            ['id' => $serviceItem->id, 'is_approved' => true, 'quantity' => 1],
        ])->assertOk()->assertJsonPath('order.status', 'IN_PROGRESS');

        $this->assertSame(3, $sparepart->fresh()->stock);
        $this->assertSame(0, $service->fresh()->stock);
        $this->assertDatabaseHas('order_items', [
            'id' => $partItem->id,
            'stock_deducted_quantity' => 2,
        ]);
        $this->assertDatabaseHas('order_items', [
            'id' => $serviceItem->id,
            'stock_deducted_quantity' => 0,
        ]);
    }

    public function test_insufficient_stock_does_not_partially_approve_an_order(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $firstPart = $this->createProduct('PART-1', 5);
        $secondPart = $this->createProduct('PART-2', 0);
        $order = $this->createOrder();
        $firstItem = $this->addItem($order, $firstPart, 2);
        $secondItem = $this->addItem($order, $secondPart, 1);

        $this->submitApproval($order, [
            ['id' => $firstItem->id, 'is_approved' => true, 'quantity' => 2],
            ['id' => $secondItem->id, 'is_approved' => true, 'quantity' => 1],
        ])->assertUnprocessable();

        $this->assertSame(5, $firstPart->fresh()->stock);
        $this->assertSame(0, $secondPart->fresh()->stock);
        $this->assertSame('PENDING_ACC', $order->fresh()->status);
        $this->assertSame(0, $firstItem->fresh()->stock_deducted_quantity);
    }

    public function test_reapproval_deducts_only_the_additional_quantity(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 8);
        $order = $this->createOrder();
        $item = $this->addItem($order, $product, 2);

        $this->submitApproval($order, [
            ['id' => $item->id, 'is_approved' => true, 'quantity' => 2],
        ])->assertOk();

        $order->refresh()->update(['status' => 'PENDING_ACC']);
        $item->update(['quantity' => 3]);
        $this->assertSame('PENDING_ACC', $order->fresh()->status);

        $secondResponse = $this->submitApproval($order, [
            ['id' => $item->id, 'is_approved' => true, 'quantity' => 3],
        ]);
        $this->assertSame(200, $secondResponse->status(), $secondResponse->getContent());

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertSame(3, $item->fresh()->stock_deducted_quantity);
    }

    public function test_rejecting_an_already_deducted_item_restores_its_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 3);
        $order = $this->createOrder();
        $item = $this->addItem($order, $product, 2, 'sparepart', 2);

        $this->submitApproval($order, [
            ['id' => $item->id, 'is_approved' => false],
        ])->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertDatabaseMissing('order_items', ['id' => $item->id]);
    }

    public function test_cancelling_an_order_restores_previously_deducted_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 3);
        $order = $this->createOrder();
        $item = $this->addItem($order, $product, 2, 'sparepart', 2);

        $this->submitApproval($order, [
            ['id' => $item->id, 'is_approved' => false],
        ], 'CANCELLED')->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertSame('CANCELLED', $order->fresh()->status);
        $this->assertSame(0, $item->fresh()->stock_deducted_quantity);
    }

    public function test_deleting_an_active_order_item_restores_deducted_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 3);
        $order = $this->createOrder('IN_PROGRESS');
        $item = $this->addItem($order, $product, 2, 'sparepart', 2);

        $this->deleteJson("/api/workshop/orders/{$order->id}/items/{$item->id}")
            ->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertDatabaseMissing('order_items', ['id' => $item->id]);
    }

    public function test_product_cannot_be_deleted_while_deducted_stock_belongs_to_an_active_order(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 3);
        $order = $this->createOrder('IN_PROGRESS');
        $this->addItem($order, $product, 2, 'sparepart', 2);

        $this->deleteJson("/api/products/{$product->id}")
            ->assertUnprocessable();

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_direct_cancellation_restores_deducted_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 3);
        $order = $this->createOrder('IN_PROGRESS');
        $this->addItem($order, $product, 2, 'sparepart', 2);

        $this->patchJson("/api/workshop/orders/{$order->id}/status", [
            'status' => 'CANCELLED',
        ])->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertSame('CANCELLED', $order->fresh()->status);
    }

    public function test_check_in_does_not_deduct_stock_before_customer_approval(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-1', 5);

        $this->postJson('/api/reception/check-in', [
            'plate_number' => 'AB 1234 CD',
            'customer_name' => 'Customer',
            'whatsapp_number' => '08123456789',
            'vehicle_brand_model' => 'Test Vehicle',
            'initial_complaint' => 'Test complaint',
            'queue_type' => 'drop_off',
            'initial_items' => [[
                'product_id' => $product->id,
                'name' => $product->name,
                'type' => 'sparepart',
                'price' => $product->selling_price,
                'quantity' => 2,
            ]],
        ])->assertCreated();

        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_check_in_rejects_out_of_stock_sparepart(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-OUT-OF-STOCK', 0);

        $this->postJson('/api/reception/check-in', [
            'plate_number' => 'AB 1234 CD',
            'customer_name' => 'Customer',
            'whatsapp_number' => '08123456789',
            'vehicle_brand_model' => 'Test Vehicle',
            'initial_complaint' => 'Test complaint',
            'queue_type' => 'drop_off',
            'initial_items' => [[
                'product_id' => $product->id,
                'name' => $product->name,
                'type' => 'sparepart',
                'price' => $product->selling_price,
                'quantity' => 1,
            ]],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('initial_items.0.quantity');

        $this->assertDatabaseCount('service_orders', 0);
    }

    public function test_out_of_stock_sparepart_cannot_be_added_to_an_order(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-OUT-OF-STOCK', 0);
        $order = $this->createOrder();

        $this->postJson("/api/workshop/orders/{$order->id}/items", [
            'item_name' => $product->name,
            'item_type' => 'sparepart',
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('product_id');

        $this->assertDatabaseMissing('order_items', [
            'service_order_id' => $order->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_out_of_stock_sparepart_quantity_cannot_be_increased(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $product = $this->createProduct('PART-OUT-OF-STOCK', 0);
        $order = $this->createOrder();
        $item = $this->addItem($order, $product, 1);

        $this->putJson("/api/workshop/orders/{$order->id}/items/{$item->id}", [
            'quantity' => 2,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('product_id');

        $this->assertSame(1, $item->fresh()->quantity);
    }

    public function test_service_can_be_added_without_sparepart_stock(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $service = $this->createProduct('SERVICE-1', 0, 'service');
        $order = $this->createOrder();

        $this->postJson("/api/workshop/orders/{$order->id}/items", [
            'item_name' => $service->name,
            'item_type' => 'service',
            'product_id' => $service->id,
            'quantity' => 1,
        ])->assertOk();

        $this->assertDatabaseHas('order_items', [
            'service_order_id' => $order->id,
            'product_id' => $service->id,
            'quantity' => 1,
        ]);
    }

    public function test_manual_status_change_cannot_skip_the_approval_stock_check(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $order = $this->createOrder();

        $this->patchJson("/api/workshop/orders/{$order->id}/status", [
            'status' => 'IN_PROGRESS',
        ])->assertUnprocessable();

        $this->assertSame('PENDING_ACC', $order->fresh()->status);
    }

    private function createProduct(string $sku, int $stock, string $type = 'sparepart'): Product
    {
        return Product::create([
            'sku' => $sku,
            'name' => $sku,
            'type' => $type,
            'cost_price' => 1000,
            'selling_price' => 1500,
            'stock' => $stock,
        ]);
    }

    private function createOrder(string $status = 'PENDING_ACC'): ServiceOrder
    {
        return ServiceOrder::create([
            'order_code' => uniqid('ORDER-'),
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Test complaint',
            'status' => $status,
        ]);
    }

    private function addItem(
        ServiceOrder $order,
        Product $product,
        int $quantity,
        string $type = 'sparepart',
        int $deductedQuantity = 0,
    ): OrderItem {
        return OrderItem::create([
            'service_order_id' => $order->id,
            'product_id' => $product->id,
            'item_name' => $product->name,
            'item_type' => $type,
            'price' => $product->selling_price,
            'cost' => $product->selling_price,
            'quantity' => $quantity,
            'stock_deducted_quantity' => $deductedQuantity,
        ]);
    }

    private function submitApproval(ServiceOrder $order, array $items, string $status = 'IN_PROGRESS')
    {
        return $this->postJson("/api/workshop/orders/{$order->id}/submit-acc", [
            'status' => $status,
            'approved_items' => $items,
        ]);
    }
}
