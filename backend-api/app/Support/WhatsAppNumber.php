<?php

namespace App\Support;

use App\Models\Customer;

class WhatsAppNumber
{
    public static function normalize(string $number): string
    {
        $digits = preg_replace('/\D+/', '', $number) ?? '';

        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '8')) {
            return '62'.$digits;
        }

        return $digits;
    }

    public static function findCustomer(string $number): ?Customer
    {
        $normalized = self::normalize($number);
        $aliases = [$normalized];

        if (str_starts_with($normalized, '62')) {
            $localNumber = substr($normalized, 2);
            $aliases[] = '0'.$localNumber;
            $aliases[] = $localNumber;
        }

        foreach (array_unique($aliases) as $alias) {
            $customer = Customer::where('whatsapp_number', $alias)->first();

            if ($customer) {
                if (
                    $customer->whatsapp_number !== $normalized
                    && ! Customer::where('whatsapp_number', $normalized)->exists()
                ) {
                    $customer->update(['whatsapp_number' => $normalized]);
                }

                return $customer;
            }
        }

        return null;
    }
}
