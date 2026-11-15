<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Mesin', 'description' => 'Gasket, seal, ring piston, timing, engine mounting, pulley, tensioner, PCV'],
            ['name' => 'Sistem Pendingin', 'description' => 'Radiator, waterpump, thermostat, tutup radiator, selang/pipa pendingin, kipas'],
            ['name' => 'Sistem Bahan Bakar', 'description' => 'Fuel pump, injektor, filter bensin/solar, tutup & corong bensin'],
            ['name' => 'Kelistrikan', 'description' => 'Aki, busi, koil, relay, sekering, soket, sensor, switch, klakson, lampu bohlam'],
            ['name' => 'AC', 'description' => 'Kompresor, kondensor, evaporator, drier, magnetic clutch, blower, filter AC, freon'],
            ['name' => 'Kaki-kaki & Suspensi', 'description' => 'Balljoint, tierod, rack end, shock, support shock, bushing, link, bearing roda'],
            ['name' => 'Rem', 'description' => 'Brake pad/shoe, master rem, wheel cylinder, kaliper, rotor, minyak rem'],
            ['name' => 'Transmisi & Kopling', 'description' => 'Kopling, CSC, CV joint, boot CV, filter matic/CVT, bearing transmisi'],
            ['name' => 'Oli & Cairan', 'description' => 'Oli mesin/gardan/ATF, coolant, grease, sealant, cairan perawatan'],
            ['name' => 'Filter & Perawatan Rutin', 'description' => 'Filter oli/udara, fanbelt, wiper, part perawatan berkala'],
            ['name' => 'Body & Interior', 'description' => 'Headlamp, stoplamp, kaca spion, lampu plafon, klip, part bodi & interior'],
        ];

        foreach ($categories as $item) {
            Category::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'name'        => $item['name'],
                    'description' => $item['description'],
                    'is_active'   => true,
                ]
            );
        }
    }
}