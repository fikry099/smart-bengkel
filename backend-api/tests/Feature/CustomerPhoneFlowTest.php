<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\ServiceOrder;
use App\Models\User;
use App\Support\WhatsAppNumber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerPhoneFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_phone_formats_normalize_to_the_same_indonesian_number(): void
    {
        $this->assertSame('628123456789', WhatsAppNumber::normalize('0812-3456-789'));
        $this->assertSame('628123456789', WhatsAppNumber::normalize('+62 812 3456 789'));
        $this->assertSame('628123456789', WhatsAppNumber::normalize('8123456789'));
    }

    public function test_existing_customer_can_log_in_with_a_different_phone_format_and_see_their_order(): void
    {
        $customer = Customer::create([
            'name' => 'Pelanggan',
            'whatsapp_number' => '08123456789',
        ]);
        ServiceOrder::create([
            'order_code' => 'PHONE-ORDER',
            'customer_id' => $customer->id,
            'plate_number' => 'AB 1234 CD',
            'initial_complaint' => 'Mesin bergetar',
            'status' => 'IN_PROGRESS',
        ]);

        $this->postJson('/api/customer/request-otp', [
            'whatsapp_number' => '+62 812-3456-789',
        ])->assertOk();

        $this->assertSame('628123456789', $customer->fresh()->whatsapp_number);
        $otpCode = $customer->fresh()->otp_code;

        $login = $this->postJson('/api/customer/verify-otp', [
            'whatsapp_number' => '0812 3456 789',
            'otp_code' => $otpCode,
        ])->assertOk();

        $this->withToken($login->json('token'))
            ->getJson('/api/customer/active-service')
            ->assertOk()
            ->assertJsonPath('order.order_code', 'PHONE-ORDER');
    }

    public function test_unregistered_phone_cannot_create_a_customer_account_from_otp_login(): void
    {
        $this->postJson('/api/customer/request-otp', [
            'whatsapp_number' => '8123456789',
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'Nomor WhatsApp belum terdaftar di bengkel. Silakan lakukan check-in terlebih dahulu.');

        $this->assertDatabaseCount('customers', 0);
    }

    public function test_check_in_reuses_a_customer_registered_with_another_phone_format(): void
    {
        $customer = Customer::create([
            'name' => 'Pelanggan',
            'whatsapp_number' => '08123456789',
        ]);
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/reception/check-in', [
            'plate_number' => 'AB 1234 CD',
            'customer_name' => 'Pelanggan',
            'whatsapp_number' => '+62 812-3456-789',
            'vehicle_brand_model' => 'Mobil',
            'initial_complaint' => 'Mesin bergetar',
            'queue_type' => 'onsite',
        ])->assertCreated();

        $this->assertSame($customer->id, $response->json('order.customer_id'));
        $this->assertSame('628123456789', $customer->fresh()->whatsapp_number);
        $this->assertDatabaseCount('customers', 1);
    }
}
