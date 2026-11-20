<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\WhatsAppNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http; // 1. Import Facade HTTP bawaan Laravel

class CustomerAuthController extends Controller
{
    // 1. Request OTP WhatsApp & Kirim Otomatis via Fonnte
    public function requestOtp(Request $request)
    {
        $request->validate([
            'whatsapp_number' => 'required|string',
        ]);

        $phone = WhatsAppNumber::normalize($request->whatsapp_number);
        $customer = WhatsAppNumber::findCustomer($phone);

        if (! $customer) {
            return response()->json([
                'message' => 'Nomor WhatsApp belum terdaftar di bengkel. Silakan lakukan check-in terlebih dahulu.',
            ], 422);
        }

        // Generate 6 Digit OTP & Atur Kadaluarsa (10 Menit)
        $otpCode = rand(100000, 999999);
        $customer->update([
            'otp_code' => $otpCode,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // 2. Susun Pesan WhatsApp OTP
        $message = "Halo! Kode verifikasi (OTP) Anda untuk masuk ke Portal Bengkel Bekti Auto Solution adalah: *{$otpCode}*.\n\nKode ini berlaku selama 10 menit. Mohon tidak membagikan kode ini kepada siapa pun demi keamanan data kendaraan Anda.";

        // 3. Kirim HTTP Request ke API Gateway Fonnte
        $fonnteToken = env('FONNTE_TOKEN');

        if ($fonnteToken) {
            Http::withHeaders([
                'Authorization' => $fonnteToken,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => $message,
                'countryCode' => '62',
            ]);
        }

        return response()->json([
            'message' => 'Kode OTP berhasil dikirim via WhatsApp.',
            'phone' => $phone,
            'debug_otp' => config('app.debug') ? $otpCode : null, // Muncul hanya dalam mode Dev Debug
        ]);
    }

    // 2. Verifikasi OTP & Terbitkan Token Sanctum
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'whatsapp_number' => 'required|string',
            'otp_code' => 'required|string|size:6',
        ]);

        $phone = WhatsAppNumber::normalize($request->whatsapp_number);

        $customer = WhatsAppNumber::findCustomer($phone);

        if (!$customer || $customer->otp_code !== $request->otp_code) {
            return response()->json(['message' => 'Kode OTP salah atau tidak ditemukan.'], 422);
        }

        if (Carbon::now()->isAfter($customer->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP telah kadaluarsa. Silakan minta kode baru.'], 422);
        }

        // Clear OTP & Generate Sanctum Token
        $customer->update(['otp_code' => null, 'otp_expires_at' => null]);
        $token = $customer->createToken('customer_pwa_token')->plainTextToken;

        return response()->json([
            'message' => 'Verifikasi berhasil.',
            'token' => $token,
            'customer' => $customer,
        ]);
    }
}
