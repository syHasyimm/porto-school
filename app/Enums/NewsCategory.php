<?php

namespace App\Enums;

enum NewsCategory: string
{
    case Umum = 'umum';
    case Kegiatan = 'kegiatan';
    case Prestasi = 'prestasi';
    case Pengumuman = 'pengumuman';

    public function label(): string
    {
        return match ($this) {
            self::Umum => 'Umum',
            self::Kegiatan => 'Kegiatan',
            self::Prestasi => 'Prestasi',
            self::Pengumuman => 'Pengumuman',
        };
    }
}
