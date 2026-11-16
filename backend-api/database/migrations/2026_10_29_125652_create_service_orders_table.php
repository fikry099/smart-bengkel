<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            
            // Relasi Relational ke Vehicle & Customer
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('cascade');
            $table->string('plate_number');
            $table->text('customer_address')->nullable();
            
            $table->unsignedBigInteger('current_mileage_km')->nullable();
            $table->text('initial_complaint');
            
            // Catatan Hasil Inspeksi / Kerusakan Tambahan Mekanik & ACC Pelanggan
            $table->text('inspection_notes')->nullable();
            $table->text('additional_notes')->nullable();
            $table->decimal('user_budget_limit', 12, 2)->nullable();
            $table->text('user_acc_notes')->nullable();
            
            // Estimasi Durasi Hari & Tanggal Target Selesai
            $table->integer('estimated_days')->default(1);
            $table->timestamp('estimated_completion_date')->nullable();
            
            $table->json('approved_items')->nullable();
            
            $table->enum('queue_type', ['onsite', 'drop_off'])->default('onsite');
            
            // Status Lifecycle Order
            $table->enum('status', [
                'QUEUED',
                'INSPECTING',
                'INSPECTED',
                'PENDING_ACC',
                'WAITING_ACC',
                'IN_PROGRESS',
                'READY_FOR_PICKUP',
                'READY',
                'COMPLETED',
                'CANCELLED'
            ])->default('QUEUED');

            // Biaya Tambahan (Fleksibel: Nominal & Alasan/Keterangan)
            $table->decimal('additional_cost', 12, 2)->default(0);
            $table->string('additional_cost_reason')->nullable();
            
            $table->decimal('difficulty_surcharge', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'QRIS'])->nullable();
            $table->decimal('amount_received', 12, 2)->nullable();
            $table->decimal('change_amount', 12, 2)->default(0);
            $table->string('payment_reference')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};