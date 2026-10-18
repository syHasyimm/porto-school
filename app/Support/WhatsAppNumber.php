<?php

namespace App\Support;

class WhatsAppNumber
{
    public static function normalize(?string $number): ?string
    {
        if ($number === null || preg_match('/[^0-9+().\s-]/', $number)) {
            return null;
        }

        $number = preg_replace('/[+().\s-]/', '', $number) ?? '';
        if (str_starts_with($number, '0')) {
            $number = '62'.substr($number, 1);
        } elseif (str_starts_with($number, '8')) {
            $number = '62'.$number;
        }

        return preg_match('/^628[1-9][0-9]{6,10}$/D', $number) ? $number : null;
    }
}
