<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique()->comment('Kode Unik Sparepart/Jasa');
            $table->string('name');
            $table->string('brand')->nullable()->comment('Merk Sparepart (misal: 555, EEP, KEN, Original)');
            $table->longText('image')->nullable()->comment('Path/Base64/URL Foto Produk');
            $table->enum('type', ['sparepart', 'service'])->default('sparepart');
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->decimal('cost_price', 12, 2)->default(0)->comment('Harga Modal/Beli');
            $table->decimal('selling_price', 12, 2)->default(0)->comment('Harga Jual/Tarif Jasa');
            $table->integer('stock')->default(0)->comment('Stok fisik');
            $table->integer('min_stock')->default(4)->comment('Batas Peringatan Stok Menipis');
            $table->string('location_rack')->nullable()->comment('Lokasi Rak Penyimpanan');
            $table->boolean('is_fast_moving')->default(false)->comment('Penanda Sparepart Fast Moving');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};