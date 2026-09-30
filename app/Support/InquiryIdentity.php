<?php

namespace App\Support;

class InquiryIdentity
{
    public static function keys(?string $email, ?string $phone): array
    {
        $digits = preg_replace('/\D/', '', $phone ?? '');
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }
        if (strlen($digits) === 11 && str_starts_with($digits, '09')) {
            $digits = '63'.substr($digits, 1);
        }
        return array_filter([
            $email ? 'email:'.hash('sha256', mb_strtolower(trim($email))) : null,
            $digits ? 'phone:'.hash('sha256', $digits) : null,
        ]);
    }
}
