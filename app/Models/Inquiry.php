<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'birthday', 'contact_number',
        'vessel', 'document_status', 'current_location', 'present_salary',
    ];

    protected $casts = ['birthday' => 'date'];
}
