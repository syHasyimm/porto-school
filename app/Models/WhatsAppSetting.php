<?php

namespace App\Models;

use Database\Factories\WhatsAppSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $token
 * @property bool $reminders_enabled
 * @property string $send_time
 * @property string $timezone
 * @property string|null $admin_phone
 */
#[Fillable(['id', 'token', 'reminders_enabled', 'send_time', 'timezone', 'admin_phone'])]
#[Hidden(['token'])]
class WhatsAppSetting extends Model
{
    /** @use HasFactory<WhatsAppSettingFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['token' => 'encrypted', 'reminders_enabled' => 'boolean'];
    }

    public static function current(): self
    {
        return self::query()->firstOrCreate(['id' => 1]);
    }

    public function effectiveToken(): ?string
    {
        $token = $this->token ?? config('services.fonnte.token');

        return is_string($token) && trim($token) !== '' ? $token : null;
    }
}
