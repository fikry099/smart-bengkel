<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\ServiceOrder;

class VehicleController extends Controller
{
    // Search Nopol & Ambil E-Logbook History
    public function searchByPlate($plateNumber)
    {
        $formattedPlate = strtoupper(trim($plateNumber));

        $vehicle = Vehicle::with('customer')
            ->where('plate_number', 'ILIKE', '%' . $formattedPlate . '%')
            ->first();

        if (!$vehicle) {
            return response()->json([
                'found'   => false,
                'message' => 'Kendaraan baru, belum ada di database.',
                'vehicle' => null,
                'history' => []
            ], 404);
        }

        // Ambil 5 riwayat servis terakhir untuk E-Logbook
        $history = ServiceOrder::where('vehicle_id', $vehicle->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'found'   => true,
            'vehicle' => [
                'id'           => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'brand_model'  => $vehicle->brand_model,
                'customer'     => $vehicle->customer
            ],
            'history' => $history
        ]);
    }
}