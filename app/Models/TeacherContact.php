<?php

namespace App\Models;

use Database\Factories\TeacherContactFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $teacher_profile_id
 * @property string $name
 * @property string|null $phone
 * @property bool $is_active
 * @property bool $notifications_enabled
 */
#[Fillable(['teacher_profile_id', 'name', 'phone', 'is_active', 'notifications_enabled'])]
class TeacherContact extends Model
{
    /** @use HasFactory<TeacherContactFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'notifications_enabled' => 'boolean'];
    }
}
