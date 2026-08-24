<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name',
        'portal_name',
        'tagline',
        'address',
        'phone',
        'email',
        'website',
        'logo',
        'seafarer_maintenance_enabled',
    ];

    protected $casts = [
        'seafarer_maintenance_enabled' => 'boolean',
    ];

    public static function defaults(): array
    {
        return [
            'company_name' => 'ALPHA OMEGA CREWING MANAGEMENT INC',
            'portal_name' => 'Anchor Point',
            'tagline' => 'Crewing & recruitment',
            'address' => '1210B 12/F 1350 Roxas Boulevard Service Road, Ermita, Manila',
            'phone' => '',
            'email' => '',
            'website' => '',
            'logo' => null,
            'seafarer_maintenance_enabled' => false,
        ];
    }

    public static function current(): self
    {
        if (! Schema::hasTable('company_settings')) {
            return new self(self::defaults());
        }

        return self::query()->first() ?: self::query()->create(self::defaults());
    }

    public function publicData(): array
    {
        return array_merge(self::defaults(), $this->only(array_keys(self::defaults())), [
            'seafarer_maintenance_enabled' => (bool) $this->seafarer_maintenance_enabled,
        ]);
    }
}
