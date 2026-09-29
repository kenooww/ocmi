<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InquiryStatusLog extends Model
{
    protected $fillable = ['user_id', 'updated_by', 'from_status', 'to_status', 'remarks'];
}
