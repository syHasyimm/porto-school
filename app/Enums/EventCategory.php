<?php

namespace App\Enums;

enum EventCategory: string
{
    case Libur = 'libur';
    case Ujian = 'ujian';
    case Kegiatan = 'kegiatan';
    case Pengumuman = 'pengumuman';

    public function label(): string
    {
        return match ($this) {
            self::Libur => 'Libur',
            self::Ujian => 'Ujian',
            self::Kegiatan => 'Kegiatan',
            self::Pengumuman => 'Pengumuman',
        };
    }
}
