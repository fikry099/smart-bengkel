<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerPortalController extends Controller
{
    public function getProfile(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        return response()->json([
            'customer' => $customer->load('vehicles'),
        ]);
    }

    // 1. Ambil Data Order Servis Aktif Pelanggan
    public function getActiveService(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $activeOrder = ServiceOrder::with(['vehicle', 'items'])
            ->where('customer_id', $customer->id)
            ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->latest()
            ->first();

        if (! $activeOrder) {
            return response()->json([
                'has_active_service' => false,
                'message' => 'Tidak ada kendaraan yang sedang diservis saat ini.'
            ]);
        }

        return response()->json([
            'has_active_service' => true,
            'order' => $activeOrder,
        ]);
    }

    // 2. Ambil Riwayat Servis Pelanggan
    public function getHistory(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $history = ServiceOrder::with(['vehicle', 'items'])
            ->where('customer_id', $customer->id)
            ->where('status', 'COMPLETED')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'history' => $history,
        ]);
    }
}
