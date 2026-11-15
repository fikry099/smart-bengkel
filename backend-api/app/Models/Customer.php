<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'whatsapp_number',
        'address',
        'otp_code',
        'otp_expires_at',
    ];

    protected $hidden = [
        'otp_code',
        'otp_expires_at',
    ];
}