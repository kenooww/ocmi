<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Principal extends Model
{
    protected $fillable = [
        'principal_name',
        'principal_code',
        'address',
        'contact',
        'email_address',
    ];
}
