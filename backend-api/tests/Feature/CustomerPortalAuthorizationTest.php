<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\ServiceOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerPortalAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_admin_workshop_routes(): void
    {
        Sanctum::actingAs(Customer::create([
            'name' => 'Customer',
            'whatsapp_number' => '628123456789',
        ]));

        $this->getJson('/api/workshop/orders')->assertForbidden();
    }

    public function test_admin_cannot_access_customer_portal_routes(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/customer/active-service')->assertForbidden();
    }

    public function test_customer_portal_only_returns_orders_owned_by_authenticated_customer(): void
    {
        $customer = Customer::create([
            'name' => 'Customer',
            'whatsapp_number' => '628123456789',
        ]);
        $otherCustomer = Customer::create([
            'name' => 'Other Customer',
            'whatsapp_number' => '628987654321',
        ]);

        ServiceOrder::create([
            'order_code' => 'OWN-ORDER',
            'customer_id' => $customer->id,
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Own order',
            'status' => 'IN_PROGRESS',
        ]);
        ServiceOrder::create([
            'order_code' => 'OTHER-ORDER',
            'customer_id' => $otherCustomer->id,
            'plate_number' => 'AB 5678 EF',
            'initial_complaint' => 'Other order',
            'status' => 'IN_PROGRESS',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/customer/active-service')
            ->assertOk()
            ->assertJsonPath('order.order_code', 'OWN-ORDER');
    }

    public function test_customer_history_only_returns_completed_orders_owned_by_authenticated_customer(): void
    {
        $customer = Customer::create([
            'name' => 'Customer',
            'whatsapp_number' => '628123456789',
        ]);
        $otherCustomer = Customer::create([
            'name' => 'Other Customer',
            'whatsapp_number' => '628987654321',
        ]);

        ServiceOrder::create([
            'order_code' => 'OWN-COMPLETED',
            'customer_id' => $customer->id,
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Own completed order',
            'status' => 'COMPLETED',
        ]);
        ServiceOrder::create([
            'order_code' => 'OTHER-COMPLETED',
            'customer_id' => $otherCustomer->id,
            'plate_number' => 'AB 5678 EF',
            'initial_complaint' => 'Other completed order',
            'status' => 'COMPLETED',
        ]);
        ServiceOrder::create([
            'order_code' => 'OWN-ACTIVE',
            'customer_id' => $customer->id,
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Own active order',
            'status' => 'IN_PROGRESS',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/customer/history')
            ->assertOk()
            ->assertJsonCount(1, 'history')
            ->assertJsonPath('history.0.order_code', 'OWN-COMPLETED');
    }

    public function test_customer_cannot_submit_estimate_approval_through_the_portal(): void
    {
        Sanctum::actingAs(Customer::create([
            'name' => 'Customer',
            'whatsapp_number' => '628123456789',
        ]));

        $this->postJson('/api/customer/estimate-acc/1', [
            'approved_item_ids' => [],
        ])->assertNotFound();
    }
}
