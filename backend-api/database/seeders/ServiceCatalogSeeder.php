<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class ServiceCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Data Kategori Jasa Servis & Perbaikan Workshop
        $categoriesData = [
            [
                'name'        => 'Jasa Mesin',
                'slug'        => 'jasa-mesin',
                'description' => 'Layanan perawatan, diagnosa, tune up, dan perbaikan komponen mesin.',
                'code'        => 'MSN',
                'services'    => [
                    ['name' => 'Scan Engine', 'price' => 50000],
                    ['name' => 'Scan & Analisa Engine', 'price' => 150000],
                    ['name' => 'Ganti Oli + Filter Oli', 'price' => 25000],
                    ['name' => 'Tune Up Basic Mobil Kecil', 'price' => 200000],
                    ['name' => 'Tune Up Basic Mobil Besar', 'price' => 300000],
                    ['name' => 'Tune Up + Gurah Mesin Mobil Kecil', 'price' => 350000],
                    ['name' => 'Tune Up + Gurah Mesin Mobil Besar', 'price' => 500000],
                    ['name' => 'Ganti Seal Dek Klep', 'price' => 150000],
                    ['name' => 'Turun Mesin 1/2 (Semi Overhaul)', 'price' => 1500000],
                    ['name' => 'Turun Mesin Full (Full Overhaul)', 'price' => 3000000],
                    ['name' => 'Cleaning Fuel Pump', 'price' => 150000],
                ]
            ],
            [
                'name'        => 'Jasa Rem',
                'slug'        => 'jasa-rem',
                'description' => 'Pemeriksaan, perawatan, dan penggantian komponen sistem pengereman.',
                'code'        => 'REM',
                'services'    => [
                    ['name' => 'Cek Rem 4 Roda', 'price' => 200000],
                    ['name' => 'Ganti Seal Kaliper (Kanan & Kiri)', 'price' => 150000],
                    ['name' => 'Ganti Wheel Silinder (Per Sisi)', 'price' => 50000],
                ]
            ],
            [
                'name'        => 'Jasa Transmisi',
                'slug'        => 'jasa-transmisi',
                'description' => 'Penggantian oli transmisi, perbaikan kopling, dan overhaul matic/manual.',
                'code'        => 'TRM',
                'services'    => [
                    ['name' => 'Ganti Oli Transmisi Manual (MTF)', 'price' => 50000],
                    ['name' => 'Ganti Oli Transmisi Matic (ATF)', 'price' => 100000],
                    ['name' => 'Resealent Carter Oli Transmisi', 'price' => 150000],
                    ['name' => 'Bongkar Pasang Kopling Set', 'price' => 600000],
                    ['name' => 'Overhaul Transmisi Matic', 'price' => 3000000],
                    ['name' => 'Jasa Penyesuaian Transmisi (Additional)', 'price' => 50000],
                ]
            ],
            [
                'name'        => 'Jasa Kaki-kaki',
                'slug'        => 'jasa-kaki-kaki',
                'description' => 'Perbaikan dan penggantian komponen suspensi, bushing, dan kemudi.',
                'code'        => 'KAK',
                'services'    => [
                    ['name' => 'Ganti Engine Mounting', 'price' => 50000],
                    ['name' => 'Ganti Lower Arm', 'price' => 150000],
                    ['name' => 'Press Bushing', 'price' => 50000],
                    ['name' => 'Ganti Bushing Member (Kanan & Kiri)', 'price' => 350000],
                    ['name' => 'Ganti Steering Rack Assy', 'price' => 250000],
                    ['name' => 'Ganti Bushing Steering Rack', 'price' => 150000],
                    ['name' => 'Ganti Bushing Beam (Kanan & Kiri)', 'price' => 450000],
                    ['name' => 'Bongkar Pasang Shock Depan (Per Sisi)', 'price' => 150000],
                    ['name' => 'Bongkar Pasang Shock Belakang (Per Sisi)', 'price' => 100000],
                    ['name' => 'Ganti Link Stabilizer (Per Sisi)', 'price' => 150000],
                    ['name' => 'Jasa Penyesuaian Kaki-kaki (Additional)', 'price' => 50000],
                ]
            ],
            [
                'name'        => 'Jasa AC Mobil',
                'slug'        => 'jasa-ac-mobil',
                'description' => 'Pemeriksaan kebocoran, pengisian freon, dan perbaikan komponen AC.',
                'code'        => 'AC',
                'services'    => [
                    ['name' => 'Cek Kebocoran Sistem AC', 'price' => 100000],
                    ['name' => 'Vakum + Isi Freon AC', 'price' => 150000],
                    ['name' => 'Ganti Seal O-Ring AC Set', 'price' => 150000],
                    ['name' => 'Ganti Magnetic Clutch AC', 'price' => 150000],
                    ['name' => 'Bongkar Pasang Evaporator + Blower + Cleaning', 'price' => 350000],
                    ['name' => 'Bongkar Pasang Dashboard', 'price' => 500000],
                    ['name' => 'Bongkar Pasang Kompresor AC', 'price' => 200000],
                    ['name' => 'Bongkar Pasang Kondensor AC', 'price' => 200000],
                    ['name' => 'Ganti Dryer AC', 'price' => 150000],
                ]
            ],
            [
                'name'        => 'Jasa Kelistrikan',
                'slug'        => 'jasa-kelistrikan',
                'description' => 'Perbaikan kabel, kelistrikan bodi, power window, hingga ECU.',
                'code'        => 'KLS',
                'services'    => [
                    ['name' => 'Ganti Bohlam Lampu (Start From)', 'price' => 20000],
                    ['name' => 'Repair Mekanisme Power Window', 'price' => 200000],
                    ['name' => 'Ganti Motor / Regulator Power Window', 'price' => 150000],
                    ['name' => 'Troubleshooting Kelistrikan (Start From)', 'price' => 150000],
                    ['name' => 'Service & Repair ECU (Start From)', 'price' => 1500000],
                ]
            ],
        ];

        // 2. Loop & Simpan ke Database
        foreach ($categoriesData as $catGroup) {
            // Buat atau cari Kategori berdasarkan slug
            $category = Category::firstOrCreate(
                ['slug' => $catGroup['slug']],
                [
                    'name'        => $catGroup['name'],
                    'description' => $catGroup['description'],
                    'is_active'   => true,
                ]
            );

            // Counter untuk generate SKU unik berurutan per kategori
            $index = 1;

            foreach ($catGroup['services'] as $svc) {
                // Format SKU: JSA-[KODE_KATEGORI]-[3_DIGIT_INDEX] (contoh: JSA-MSN-001)
                $sku = sprintf('JSA-%s-%03d', $catGroup['code'], $index);

                Product::updateOrCreate(
                    ['sku' => $sku],
                    [
                        'name'           => $svc['name'],
                        'brand'          => 'Bekti Auto Solution',
                        'image'          => null,
                        'type'           => 'service',
                        'category_id'    => $category->id,
                        'cost_price'     => 0,
                        'selling_price'  => $svc['price'],
                        'stock'          => 0,
                        'min_stock'      => 0,
                        'location_rack'  => null,
                        'is_fast_moving' => false,
                        'is_active'      => true,
                    ]
                );

                $index++;
            }
        }
    }
}