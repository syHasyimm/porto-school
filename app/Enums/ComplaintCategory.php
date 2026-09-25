<?php

namespace App\Enums;

enum ComplaintCategory: string
{
    case Akademik = 'akademik';
    case Fasilitas = 'fasilitas';
    case Layanan = 'layanan';
    case Keamanan = 'keamanan';
    case Lainnya = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::Akademik => 'Akademik',
            self::Fasilitas => 'Fasilitas',
            self::Layanan => 'Layanan',
            self::Keamanan => 'Keamanan',
            self::Lainnya => 'Lainnya',
        };
    }
}
