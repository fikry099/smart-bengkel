<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
        public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Owner - Bekti Auto Solution',
            'email' => 'admin@bektiauto.com',
            'password' => bcrypt('admin123'),
        ]);
    }
}
